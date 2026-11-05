frappe.query_reports["Debtor Case Report"] = {
	filters: [
		{ fieldname: "client", label: __("Client"), fieldtype: "Link", options: "Recovery Client" },
		{ fieldname: "status", label: __("Status"), fieldtype: "Select", options: "\nNew\nContacted\nPromise to Pay\nPayment Plan\nPolice Case\nProsecution\nSettled\nReturned to Client\nClosed" },
		{ fieldname: "police_case", label: __("Police Case"), fieldtype: "Select", options: "\nYes\nNo" },
		{ fieldname: "from_date", label: __("Acquired From"), fieldtype: "Date" },
		{ fieldname: "to_date", label: __("Acquired To"), fieldtype: "Date" },
		{ fieldname: "assigned_to", label: __("Assigned To"), fieldtype: "Link", options: "Employee" },
		{ fieldname: "with_balance", label: __("Only With Balance"), fieldtype: "Check" },
	],
};
