import json

import frappe
from frappe.permissions import add_permission

LIST_COLUMNS = ["debt_total_amount", "debtor_name", "client", "debt_collected_amount", "debt_balance_amount"]


def ensure_roles():
	for r in ("Debt Officer", "Debt Manager"):
		if not frappe.db.exists("Role", r):
			frappe.get_doc({"doctype": "Role", "role_name": r, "desk_access": 1}).insert(ignore_permissions=True)
	# link targets the case form needs to read
	for dt in ("Sales Person", "Currency", "Contract"):
		for r in ("Debt Officer", "Debt Manager"):
			add_permission(dt, r, 0)
	if frappe.db.exists("Currency", "BHD"):
		frappe.db.set_value("Currency", "BHD", {"enabled": 1, "symbol": "BD"})
	ensure_list_view()


def ensure_list_view():
	"""Column order of the Debtor Case list: Claim Amount, Debtor Name, Client, Total Payment, Balance."""
	if frappe.db.exists("List View Settings", "Debtor Case"):
		doc = frappe.get_doc("List View Settings", "Debtor Case")
	else:
		doc = frappe.new_doc("List View Settings")
		doc.__newname = "Debtor Case"
	meta = frappe.get_meta("Debtor Case")
	doc.fields = json.dumps([{"fieldname": f, "label": meta.get_label(f)} for f in LIST_COLUMNS])
	doc.total_fields = "8"
	doc.disable_count = 0
	doc.save(ignore_permissions=True)
