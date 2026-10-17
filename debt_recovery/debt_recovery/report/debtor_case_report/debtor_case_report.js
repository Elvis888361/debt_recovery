frappe.query_reports["Debtor Case Report"] = {
	filters: [
		{ fieldname: "client", label: __("Client"), fieldtype: "Link", options: "Recovery Client" },
		{ fieldname: "status", label: __("Status"), fieldtype: "Select", options: "\nOpen\nUnder Tracing\nPromise to Pay\nPayment Plan\nSettled\nReturned to Client\nClosed" },
		{ fieldname: "police_case", label: __("Police Case"), fieldtype: "Select", options: "\nYes\nNo" },
		{ fieldname: "from_date", label: __("Booked From"), fieldtype: "Date" },
		{ fieldname: "to_date", label: __("Booked To"), fieldtype: "Date" },
		{ fieldname: "collector", label: __("Agent"), fieldtype: "Link", options: "Sales Person" },
		{ fieldname: "with_balance", label: __("Only With Balance"), fieldtype: "Check" },
	],
};
