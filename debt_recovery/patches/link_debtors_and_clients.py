import frappe

from debt_recovery.utils import match_debtor


def execute():
	"""Cases that have a Debtor Name / Client Name but no Debtor / Client link: find the record, or create it.

	NOTE: not listed in patches.txt on purpose. On the first site it was checked against, 190 imported cases had the
	creditor names (TNT, FedEx) in "Debtor Name" and the real debtor companies in "Client Name" (columns swapped
	during import). Running this as-is would have created 190 wrong clients. Fix or confirm the data first.

	Only the link fields are written (no case save), so locked or otherwise invalid cases are still repaired
	and nothing else on the case changes. Safe to run again.
	"""
	linked_debtors = created_debtors = linked_clients = created_clients = skipped = 0
	pct = frappe.utils.flt(frappe.db.get_single_value("Debt Recovery Settings", "default_commission_percent"))

	for c in frappe.get_all(
		"Debtor Case",
		filters={"debtor": ["in", ["", None]], "debtor_name": ["not in", ["", None]]},
		fields=["name", "debtor_name", "debtor_cpr"],
	):
		name, cpr = c.debtor_name.strip(), (c.debtor_cpr or "").strip()
		debtor = match_debtor(name, cpr)
		if debtor:
			linked_debtors += 1
			if cpr and not frappe.db.get_value("Debtor", debtor, "cpr"):
				frappe.db.set_value("Debtor", debtor, "cpr", cpr, update_modified=False)
		else:
			try:
				debtor = frappe.get_doc({"doctype": "Debtor", "debtor_name": name, "cpr": cpr or None}).insert(ignore_permissions=True).name
				created_debtors += 1
			except Exception:
				frappe.log_error(title=f"Debt Recovery: could not create debtor for {c.name}")
				skipped += 1
				continue
		frappe.db.set_value("Debtor Case", c.name, "debtor", debtor, update_modified=False)

	for c in frappe.get_all(
		"Debtor Case",
		filters={"client": ["in", ["", None]], "client_name": ["not in", ["", None]]},
		fields=["name", "client_name"],
	):
		typed = c.client_name.strip()
		client = frappe.db.get_value("Recovery Client", typed)
		if client:
			linked_clients += 1
		else:
			try:
				client = frappe.get_doc(
					{"doctype": "Recovery Client", "client_name": typed, "status": "Active",
					 "commissions": [{"commission_name": "Standard", "commission_percent": pct}]}
				).insert(ignore_permissions=True).name
				created_clients += 1
			except Exception:
				frappe.log_error(title=f"Debt Recovery: could not create client for {c.name}")
				skipped += 1
				continue
		frappe.db.set_value("Debtor Case", c.name, {"client": client, "client_name": client}, update_modified=False)

	print(
		f"link_debtors_and_clients: debtors linked {linked_debtors}, created {created_debtors}; "
		f"clients linked {linked_clients}, created {created_clients}; skipped {skipped}"
	)
