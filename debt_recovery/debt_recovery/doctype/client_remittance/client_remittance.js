frappe.ui.form.on("Client Remittance", {
	refresh(frm) {
		if (frm.doc.docstatus === 0 && frm.doc.client) {
			frm.add_custom_button(__("Pull all payable cases"), () => frm.trigger("pull_cases"));
		}
	},
	client(frm) { if (frm.doc.client && frm.is_new() && !(frm.doc.items || []).length) frm.trigger("pull_cases"); },
	pull_cases(frm) {
		frappe.call("debt_recovery.debt_recovery.doctype.client_remittance.client_remittance.get_payable_cases", { client: frm.doc.client }).then((r) => {
			frm.clear_table("items");
			(r.message || []).forEach((c) => frm.add_child("items", { debtor_case: c.debtor_case, debtor_name: c.debtor_name, available: c.available, amount: c.available }));
			frm.refresh_field("items");
		});
	},
});
