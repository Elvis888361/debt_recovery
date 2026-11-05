frappe.ui.form.on("Debtor Case", {
	client(frm) {
		if (frm.doc.client) frappe.db.get_value("Recovery Client", frm.doc.client, "commission_percent").then((r) => frm.set_value("commission_percent", r.message.commission_percent));
	},
	refresh(frm) {
		if (frm.is_new()) return;
		["Invitation Letter", "Current Amount"].forEach((fmt) =>
			frm.add_custom_button(__(fmt), () => {
				const q = { doctype: frm.doctype, name: frm.doc.name, format: fmt, no_letterhead: 1, _lang: "en" };
				window.open(frappe.urllib.get_full_url("/printview?" + new URLSearchParams(q).toString()));
			}, __("Print Letter"))
		);
		frm.add_custom_button(__("Client"), () => frappe.set_route("Form", "Recovery Client", frm.doc.client), __("View"));
		if (frm.doc.payable_balance > 0) frm.dashboard.set_headline(__("We still owe the client {0} from this case", [format_currency(frm.doc.payable_balance)]));
	},
});
