frappe.listview_settings["Debtor Case"] = {
	add_fields: ["status", "debt_balance_amount"],
	get_indicator(doc) {
		const c = { New: "blue", Contacted: "light-blue", "Promise to Pay": "orange", "Payment Plan": "yellow", "Police Case": "red", Prosecution: "red", Settled: "green", "Returned to Client": "gray", Closed: "gray" };
		return [__(doc.status), c[doc.status] || "gray", "status,=," + doc.status];
	},
};
