import frappe

from debt_recovery.utils import owner_sql


def execute(filters=None):
	f = frappe._dict(filters or {})
	cond, val = ["1=1"], {}
	if f.client:
		cond.append("client = %(client)s"); val["client"] = f.client
	if f.from_date:
		cond.append("acquired_date >= %(from_date)s"); val["from_date"] = f.from_date
	if f.to_date:
		cond.append("acquired_date <= %(to_date)s"); val["to_date"] = f.to_date
	money = lambda label, fn, w=120: {"label": label, "fieldname": fn, "fieldtype": "Currency", "width": w}
	totals = """sum(debt_total_amount) total, sum(debt_adjustment_amount) adjustment, sum(debt_collected_amount) collected,
		sum(debt_balance_amount) balance, sum(commission_amount) commission, sum(remitted_amount) remitted, sum(payable_balance) payable"""
	if f.group_by_client:
		cols = [{"label": "Client", "fieldname": "client", "fieldtype": "Link", "options": "Recovery Client", "width": 220},
			{"label": "Cases", "fieldname": "cases", "fieldtype": "Int", "width": 70}]
		sql = f"select client, count(*) cases, {totals} from `tabDebtor Case` where {' and '.join(cond)}{owner_sql()} group by client order by client"
	else:
		cols = [{"label": "Client", "fieldname": "client", "fieldtype": "Link", "options": "Recovery Client", "width": 160},
			{"label": "Case", "fieldname": "name", "fieldtype": "Link", "options": "Debtor Case", "width": 130},
			{"label": "Debtor", "fieldname": "debtor_name", "fieldtype": "Data", "width": 180},
			{"label": "Booking Date", "fieldname": "acquired_date", "fieldtype": "Date", "width": 100}]
		totals = totals.replace("sum(", "(").replace(") ", ") ")
		sql = f"""select client, name, debtor_name, acquired_date, debt_total_amount total, debt_adjustment_amount adjustment,
			debt_collected_amount collected, debt_balance_amount balance, commission_amount commission, remitted_amount remitted,
			payable_balance payable from `tabDebtor Case` where {' and '.join(cond)}{owner_sql()} order by client, acquired_date"""
	cols += [money("Total Debt", "total"), money("Adjustment", "adjustment", 100), money("Collected", "collected"),
		money("Balance Owed by Debtors", "balance", 140), money("Our Commission", "commission"),
		money("Paid to Client", "remitted"), money("Still Owe Client", "payable")]
	return cols, frappe.db.sql(sql, val, as_dict=True)
