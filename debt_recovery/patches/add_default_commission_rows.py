import frappe


def execute():
	"""Turn each client's single commission % into the first (default) row of the new Commissions table.

	Rows are inserted as child records on their own, so clients that are locked (docstatus 1) or fail
	their own validation never stop the migration.
	"""
	for c in frappe.get_all("Recovery Client", fields=["name", "commission_percent"]):
		if frappe.db.exists("Recovery Client Commission", {"parent": c.name, "parenttype": "Recovery Client"}):
			continue
		try:
			frappe.get_doc(
				{
					"doctype": "Recovery Client Commission",
					"parent": c.name,
					"parenttype": "Recovery Client",
					"parentfield": "commissions",
					"idx": 1,
					"commission_name": "Standard",
					"commission_percent": c.commission_percent or 0,
				}
			).insert(ignore_permissions=True)
		except Exception:
			frappe.log_error(title=f"Debt Recovery: default commission row for {c.name}")
