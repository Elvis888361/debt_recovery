import json

from frappe.core.doctype.deleted_document.deleted_document import DeletedDocument


def debt_links(doctype, name, data):
	"""(debtor, client) names to show against a deleted Debt Recovery document, or (None, None)."""
	try:
		d = json.loads(data or "{}")
	except ValueError:
		return None, None
	if doctype == "Debtor Case":
		return d.get("debtor_name") or d.get("debtor"), d.get("client_name") or d.get("client")
	if doctype == "Client Remittance":
		return None, d.get("client")
	if doctype == "Debtor":
		return d.get("debtor_name") or name, None
	if doctype == "Recovery Client":
		return None, d.get("client_name") or name
	return None, None


class DebtDeletedDocument(DeletedDocument):
	"""Deleted Document rows are written with db_insert(), so fill the Debtor/Client columns there."""

	def db_insert(self, *args, **kwargs):
		self.debtor, self.client = debt_links(self.deleted_doctype, self.deleted_name, self.data)
		super().db_insert(*args, **kwargs)
