import frappe


def execute():
	"""Copy each linked Debtor's email / remarks onto its cases (the new Debtor Email / Debtor Remark fields)."""
	for c in frappe.get_all("Debtor Case", filters={"debtor": ["not in", ["", None]]}, fields=["name", "debtor", "debtor_email", "debtor_remark"]):
		if c.debtor_email or c.debtor_remark:
			continue
		deb = frappe.db.get_value("Debtor", c.debtor, ["email", "remarks"], as_dict=True)
		if deb and (deb.email or deb.remarks):
			frappe.db.set_value("Debtor Case", c.name, {"debtor_email": deb.email, "debtor_remark": deb.remarks}, update_modified=False)
