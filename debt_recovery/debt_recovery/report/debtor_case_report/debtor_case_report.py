import frappe

from debt_recovery.utils import owner_sql


def execute(filters=None):
	filters = frappe._dict(filters or {})
	return get_columns(), get_data(filters)


def get_columns():
	return [
		{"label": "Case", "fieldname": "name", "fieldtype": "Link", "options": "Debtor Case", "width": 130},
		{"label": "Debtor Name", "fieldname": "debtor_name", "fieldtype": "Data", "width": 200},
		{"label": "CPR / ID", "fieldname": "debtor_cpr", "fieldtype": "Data", "width": 110},
		{"label": "Client", "fieldname": "client", "fieldtype": "Link", "options": "Recovery Client", "width": 180},
		{"label": "Client Ref", "fieldname": "client_reference", "fieldtype": "Data", "width": 110},
		{"label": "Status", "fieldname": "status", "fieldtype": "Data", "width": 100},
		{"label": "Acquired On", "fieldname": "acquired_date", "fieldtype": "Date", "width": 100},
		{"label": "Invoice Numbers", "fieldname": "invoice_numbers", "fieldtype": "Data", "width": 200},
		{"label": "Police Case", "fieldname": "has_police_case", "fieldtype": "Data", "width": 80},
		{"label": "Police Case No", "fieldname": "police_case_number", "fieldtype": "Data", "width": 120},
		{"label": "Police Case Date", "fieldname": "police_case_date", "fieldtype": "Date", "width": 110},
		{"label": "Police Station", "fieldname": "police_station_name", "fieldtype": "Data", "width": 140},
		{"label": "Prosecution No", "fieldname": "prosecution_case_number", "fieldtype": "Data", "width": 120},
		{"label": "Assigned To", "fieldname": "assigned_to", "fieldtype": "Link", "options": "Employee", "width": 110},
		{"label": "Total", "fieldname": "debt_total_amount", "fieldtype": "Currency", "width": 110},
		{"label": "Collected", "fieldname": "debt_collected_amount", "fieldtype": "Currency", "width": 110},
		{"label": "Adjustment", "fieldname": "debt_adjustment_amount", "fieldtype": "Currency", "width": 100},
		{"label": "Balance", "fieldname": "debt_balance_amount", "fieldtype": "Currency", "width": 110},
		{"label": "Our Commission", "fieldname": "commission_amount", "fieldtype": "Currency", "width": 110},
		{"label": "Paid to Client", "fieldname": "remitted_amount", "fieldtype": "Currency", "width": 110},
		{"label": "Still Owe Client", "fieldname": "payable_balance", "fieldtype": "Currency", "width": 110},
	]


def get_data(f):
	cond, val = ["1=1"], {}
	for key in ("client", "status", "assigned_to"):
		if f.get(key):
			cond.append(f"dc.{key} = %({key})s")
			val[key] = f[key]
	if f.police_case:
		cond.append("dc.has_police_case = %(pc)s")
		val["pc"] = 1 if f.police_case == "Yes" else 0
	if f.from_date:
		cond.append("dc.acquired_date >= %(from_date)s")
		val["from_date"] = f.from_date
	if f.to_date:
		cond.append("dc.acquired_date <= %(to_date)s")
		val["to_date"] = f.to_date
	if f.with_balance:
		cond.append("dc.debt_balance_amount > 0")
	rows = frappe.db.sql(
		f"""
		select dc.name, dc.debtor_name, dc.debtor_cpr, dc.client, dc.client_reference, dc.status, dc.acquired_date,
			(select group_concat(i.invoice_number order by i.idx separator ', ') from `tabDebt Invoice` i
				where i.parent = dc.name and i.parenttype = 'Debtor Case') invoice_numbers,
			if(dc.has_police_case, 'Yes', 'No') has_police_case, dc.police_case_number, dc.police_case_date,
			dc.police_station_name, dc.prosecution_case_number, dc.assigned_to,
			dc.debt_total_amount, dc.debt_collected_amount, dc.debt_adjustment_amount, dc.debt_balance_amount, dc.commission_amount, dc.remitted_amount, dc.payable_balance
		from `tabDebtor Case` dc where {' and '.join(cond)}{owner_sql('dc')} order by dc.acquired_date desc, dc.name desc
		""",
		val,
		as_dict=True,
	)
	return rows
