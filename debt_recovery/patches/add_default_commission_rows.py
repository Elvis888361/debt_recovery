import frappe


def execute():
	"""Turn each client's single commission % into the first (default) row of the new Commissions table."""
	for c in frappe.get_all("Recovery Client", pluck="name"):
		doc = frappe.get_doc("Recovery Client", c)
		if not doc.commissions:
			doc.append("commissions", {"commission_name": "Standard", "commission_percent": doc.commission_percent or 0})
			doc.save(ignore_permissions=True)
