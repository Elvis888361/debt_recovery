import frappe
from frappe.model.document import Document


class Debtor(Document):
	def autoname(self):
		"""The debtor's own name is the record name; a clash gets the CPR (then a number) added."""
		base = (self.debtor_name or "").strip()
		name = base
		if frappe.db.exists("Debtor", name) and self.cpr:
			name = f"{base} - {self.cpr}"
		i = 1
		while frappe.db.exists("Debtor", name):
			i += 1
			name = f"{base} - {i}"
		self.name = name
