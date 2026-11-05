import frappe
from frappe.model.document import Document
from frappe.utils import flt


class DebtorCase(Document):
	def validate(self):
		if self.commission_percent in (None, "") and self.client:
			self.commission_percent = frappe.db.get_value("Recovery Client", self.client, "commission_percent")
		self.compute_totals()
		if not self.has_police_case:
			self.police_case_number = self.police_case_date = self.police_station_name = self.prosecution_case_number = None
		elif not self.police_case_number:
			frappe.throw("Police Case Number is required when Police Case Filed is ticked")
		if self.status in ("Police Case", "Prosecution") and not self.has_police_case:
			frappe.throw("Tick Police Case Filed first")

	def compute_totals(self):
		self.debt_total_amount = sum(flt(r.amount) for r in self.invoices)
		self.debt_collected_amount = sum(flt(r.amount) for r in self.payments)
		self.debt_balance_amount = flt(self.debt_total_amount) - flt(self.debt_collected_amount) - flt(self.debt_adjustment_amount)
		if self.debt_balance_amount < 0:
			frappe.throw("Collected + adjustment is more than the total debt")
		self.commission_amount = flt(self.debt_collected_amount) * flt(self.commission_percent) / 100
		self.net_payable_to_client = flt(self.debt_collected_amount) - flt(self.commission_amount)
		if flt(self.remitted_amount) > flt(self.net_payable_to_client) + 0.0005:
			frappe.throw("We have already paid the client more than their share of what was collected")
		self.payable_balance = flt(self.net_payable_to_client) - flt(self.remitted_amount)
		if self.invoices and self.debt_balance_amount == 0 and self.status not in ("Settled", "Closed", "Returned to Client"):
			self.status = "Settled"
		self.set_next_followup()

	def set_next_followup(self):
		dates = [r.promise_date for r in self.followups if r.promise_date]
		if dates and self.debt_balance_amount > 0:
			self.next_followup_date = max(dates)

	def update_payable(self):
		self.payable_balance = flt(self.net_payable_to_client) - flt(self.remitted_amount)
		frappe.db.set_value("Debtor Case", self.name, "payable_balance", self.payable_balance)
