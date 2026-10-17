import frappe

SEE_ALL = {"System Manager", "Accounts Manager", "Debt Manager", "Accounts User"}


def sees_all(user=None):
	user = user or frappe.session.user
	return user == "Administrator" or bool(SEE_ALL & set(frappe.get_roles(user)))


def owner_sql(alias=""):
	"""SQL tail that limits raw queries on Debtor Case to the user's own records (Debt Officer rule)."""
	if sees_all():
		return ""
	return f" and {alias + '.' if alias else ''}owner = {frappe.db.escape(frappe.session.user)}"
