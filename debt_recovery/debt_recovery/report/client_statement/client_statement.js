frappe.query_reports["Client Statement"] = {
	filters: [
		{ fieldname: "client", label: __("Client"), fieldtype: "Link", options: "Recovery Client" },
		{ fieldname: "from_date", label: __("Acquired From"), fieldtype: "Date" },
		{ fieldname: "to_date", label: __("Acquired To"), fieldtype: "Date" },
		{ fieldname: "group_by_client", label: __("Summary per Client"), fieldtype: "Check" },
	],
};
