import frappe
from frappe.model.document import Document
from frappe.utils import flt


def refresh_case_remitted(case):
	paid = frappe.db.sql(
		"""select ifnull(sum(i.amount),0) from `tabClient Remittance Item` i join `tabClient Remittance` r on r.name=i.parent
		where i.debtor_case=%s and r.docstatus=1""", case)[0][0]
	frappe.db.set_value("Debtor Case", case, "remitted_amount", flt(paid))
	frappe.get_doc("Debtor Case", case).update_payable()


class ClientRemittance(Document):
	def validate(self):
		total = 0
		for row in self.items:
			case = frappe.db.get_value("Debtor Case", row.debtor_case, ["client", "net_payable_to_client", "remitted_amount"], as_dict=True)
			if case.client != self.client:
				frappe.throw(f"Row {row.idx}: {row.debtor_case} belongs to {case.client}, not {self.client}")
			row.available = flt(case.net_payable_to_client) - flt(case.remitted_amount)
			if flt(row.amount) <= 0:
				frappe.throw(f"Row {row.idx}: amount must be more than zero")
			if self.docstatus == 0 and flt(row.amount) > flt(row.available) + 0.0005:
				frappe.throw(f"Row {row.idx}: {row.debtor_case} only has {row.available} available to pay the client")
			total += flt(row.amount)
		self.total_amount = total

	def on_submit(self):
		for c in {r.debtor_case for r in self.items}:
			refresh_case_remitted(c)

	def on_cancel(self):
		for c in {r.debtor_case for r in self.items}:
			refresh_case_remitted(c)


@frappe.whitelist()
def get_payable_cases(client):
	"""Cases of this client where we still owe money."""
	return frappe.db.sql(
		"""select name debtor_case, debtor_name, net_payable_to_client - remitted_amount available
		from `tabDebtor Case` where client=%s and net_payable_to_client - remitted_amount > 0.0005 order by acquired_date""",
		client, as_dict=True)
