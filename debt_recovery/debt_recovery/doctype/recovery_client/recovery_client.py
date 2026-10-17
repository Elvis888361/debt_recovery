import frappe
from frappe.model.document import Document
from frappe.utils import flt

from debt_recovery.utils import owner_sql


class RecoveryClient(Document):
	def validate(self):
		if not self.commissions:
			frappe.throw("Add at least one commission row - the first row is the default for new cases")
		names = set()
		for r in self.commissions:
			if not 0 <= flt(r.commission_percent) <= 100:
				frappe.throw(f"Row {r.idx}: Commission % must be between 0 and 100")
			if r.commission_name.strip().lower() in names:
				frappe.throw(f"Row {r.idx}: commission name '{r.commission_name}' is used twice")
			names.add(r.commission_name.strip().lower())
		self.commission_percent = flt(self.commissions[0].commission_percent)  # default = first row


@frappe.whitelist()
def get_summary(client):
	r = frappe.db.sql(
		"""select count(*) cases, ifnull(sum(debt_total_amount),0) entrusted, ifnull(sum(debt_collected_amount),0) collected,
			ifnull(sum(commission_amount),0) commission, ifnull(sum(remitted_amount),0) remitted,
			ifnull(sum(debt_balance_amount),0) outstanding
		from `tabDebtor Case` where client=%s""" + owner_sql(), client, as_dict=True)[0]
	r["payable_to_client"] = flt(r.collected) - flt(r.commission) - flt(r.remitted)
	return r
