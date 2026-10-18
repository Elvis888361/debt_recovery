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


def match_debtor(name, cpr=None):
	"""Existing Debtor for a typed name/CPR: CPR first, then the same name with no (or a matching) CPR."""
	name, cpr = (name or "").strip(), (cpr or "").strip()
	existing = frappe.db.get_value("Debtor", {"cpr": cpr}) if cpr else None
	if not existing and name:
		cond = {"debtor_name": name} if not cpr else {"debtor_name": name, "cpr": ["in", ["", None]]}
		existing = frappe.db.get_value("Debtor", cond)
	return existing
