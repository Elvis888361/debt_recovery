import frappe
from frappe.model.document import Document


class Debtor(Document):
	def autoname(self):
		self.name = "DBT-" + frappe.generate_hash(length=8).upper()
