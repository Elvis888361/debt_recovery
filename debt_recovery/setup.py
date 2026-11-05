import frappe


def ensure_roles():
	for r in ("Debt Officer", "Debt Manager"):
		if not frappe.db.exists("Role", r):
			frappe.get_doc({"doctype": "Role", "role_name": r, "desk_access": 1}).insert(ignore_permissions=True)
