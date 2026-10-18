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
	ensure_deleted_document_columns()


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


def ensure_deleted_document_columns():
	"""Debtor and Client columns (list + filter) on Deleted Document, back-filled for rows already there."""
	from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

	common = {"fieldtype": "Data", "in_list_view": 1, "in_standard_filter": 1, "search_index": 1, "read_only": 1}
	create_custom_fields(
		{
			"Deleted Document": [
				{"fieldname": "debtor", "label": "Debtor", "insert_after": "deleted_doctype", **common},
				{"fieldname": "client", "label": "Client", "insert_after": "debtor", **common},
			]
		},
		update=True,
	)
	from debt_recovery.overrides import debt_links

	for r in frappe.get_all(
		"Deleted Document",
		filters={"deleted_doctype": ["in", ["Debtor Case", "Client Remittance", "Debtor", "Recovery Client"]], "debtor": ["is", "not set"], "client": ["is", "not set"]},
		fields=["name", "deleted_doctype", "deleted_name", "data"],
	):
		debtor, client = debt_links(r.deleted_doctype, r.deleted_name, r.data)
		if debtor or client:
			frappe.db.set_value("Deleted Document", r.name, {"debtor": debtor, "client": client}, update_modified=False)
