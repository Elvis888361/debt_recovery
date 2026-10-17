frappe.ui.form.on("Recovery Client", {
	refresh(frm) {
		if (frm.is_new()) return;
		frm.add_custom_button(__("Debtors"), () => frappe.set_route("List", "Debtor Case", { client: frm.doc.name }), __("View"));
		frm.add_custom_button(__("Remittances"), () => frappe.set_route("List", "Client Remittance", { client: frm.doc.name }), __("View"));
		frm.add_custom_button(__("New Debtor Case"), () => frappe.new_doc("Debtor Case", { client: frm.doc.name }));
		frappe.call("debt_recovery.debt_recovery.doctype.recovery_client.recovery_client.get_summary", { client: frm.doc.name }).then((r) => {
			const s = r.message, f = (v) => format_currency(v, "BHD", 3);
			frm.dashboard.set_headline(
				`${s.cases} cases &nbsp;|&nbsp; Entrusted ${f(s.entrusted)} &nbsp;|&nbsp; Collected ${f(s.collected)} &nbsp;|&nbsp; Our commission ${f(s.commission)} &nbsp;|&nbsp; Paid to client ${f(s.remitted)} &nbsp;|&nbsp; <b>Still owe client ${f(s.payable_to_client)}</b>`
			);
		});
	},
});
