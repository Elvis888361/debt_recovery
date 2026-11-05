import frappe
from frappe.modules.import_file import import_file_by_path
from frappe.modules import get_module_path


def execute():
	"""Force re-import of the two Prime Gulf letters (ignores the modified-date check)."""
	base = get_module_path("Debt Recovery")
	for name in ("invitation_letter", "current_amount"):
		path = f"{base}/print_format/{name}/{name}.json"
		import_file_by_path(path, force=True, ignore_version=True)
	frappe.db.commit()
