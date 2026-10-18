import json

import frappe
from frappe.model.document import Document
import calendar
from datetime import timedelta

from frappe.utils import add_days, flt, get_fullname, getdate, nowdate

from debt_recovery.utils import sees_all


class DebtorCase(Document):
	def validate(self):
		self.sync_client()
		self.resolve_commission()
		self.sync_debtor()
		self.has_police_case = 1 if (self.case_type in ("Police Station", "Prosecution") or self.police_case_number) else 0
		self.sync_latest_followup()
		self.compute_totals()
		self.update_schedule()

	def sync_client(self):
		"""Typing a client name links the matching Recovery Client on save; the linked client's name wins otherwise."""
		typed = (self.client_name or "").strip()
		if typed and (not self.client or typed.lower() != self.client.lower()):
			match = frappe.db.get_value("Recovery Client", typed)
			if match:
				self.client = match
				frappe.msgprint(f"Matched client <b>{match}</b>", alert=True, indicator="green")
			elif not self.client:
				pct = flt(frappe.db.get_single_value("Debt Recovery Settings", "default_commission_percent"))
				new = frappe.get_doc(
					{"doctype": "Recovery Client", "client_name": typed, "status": "Active",
					 "commissions": [{"commission_name": "Standard", "commission_percent": pct}]}
				).insert(ignore_permissions=True)
				self.client = new.name
				frappe.msgprint(f"No client named <b>{typed}</b> existed - created it with a Standard commission of {pct}%. Please review it.", alert=True, indicator="blue")
		if self.client:
			self.client_name = self.client

	def resolve_commission(self):
		"""Client's first commission row is the default; a chosen plan sets its own %; a typed % is kept as a special deal."""
		if not self.client:
			return
		rows = frappe.get_all("Recovery Client Commission", filters={"parent": self.client, "parenttype": "Recovery Client"},
			fields=["commission_name", "commission_percent"], order_by="idx")
		if not rows:
			return
		plan = next((r for r in rows if r.commission_name == self.commission_plan), None) if self.commission_plan else None
		fresh = self.is_new() or self.has_value_changed("client")
		if plan and (fresh or self.has_value_changed("commission_plan") or not flt(self.commission_percent)):
			self.commission_percent = plan.commission_percent
		elif not plan and (fresh and not flt(self.commission_percent) or self.commission_percent in (None, "")):
			self.commission_plan, self.commission_percent = rows[0].commission_name, rows[0].commission_percent

	def sync_debtor(self):
		"""Debtor is optional: a typed name links (or creates) the Debtor; edits to name/CPR flow back to it."""
		name, cpr = (self.debtor_name or "").strip(), (self.debtor_cpr or "").strip()
		if not self.debtor:
			if not name:
				frappe.throw("Enter a Debtor, or type the Debtor Name")
			existing = frappe.db.get_value("Debtor", {"cpr": cpr}) if cpr else None
			if not existing:  # same name, and either no CPR was typed or the stored debtor has none yet
				cond = {"debtor_name": name} if not cpr else {"debtor_name": name, "cpr": ["in", ["", None]]}
				existing = frappe.db.get_value("Debtor", cond)
			if existing:
				self.debtor = existing
				deb = frappe.db.get_value("Debtor", existing, ["debtor_name", "cpr"], as_dict=True)
				if cpr and not deb.cpr:
					frappe.db.set_value("Debtor", existing, "cpr", cpr)
				self.debtor_name, self.debtor_cpr = deb.debtor_name, cpr or deb.cpr
				frappe.msgprint(f"Matched existing debtor <b>{existing}</b>", alert=True, indicator="green")
			else:
				self.debtor = frappe.get_doc({"doctype": "Debtor", "debtor_name": name, "cpr": cpr or None}).insert(ignore_permissions=True).name
				frappe.msgprint(f"No existing debtor found - created <b>{self.debtor}</b>", alert=True, indicator="blue")
			return
		deb = frappe.db.get_value("Debtor", self.debtor, ["debtor_name", "cpr"], as_dict=True)
		if not name:  # picked a debtor and left the name blank (e.g. API/import): take it from the Debtor
			self.debtor_name, self.debtor_cpr = deb.debtor_name, deb.cpr
			return
		edited = self.is_new() or ((self.has_value_changed("debtor_name") or self.has_value_changed("debtor_cpr")) and not self.has_value_changed("debtor"))
		if edited and (name != (deb.debtor_name or "") or cpr != (deb.cpr or "")):
			frappe.db.set_value("Debtor", self.debtor, {"debtor_name": name, "cpr": cpr or None})
			frappe.db.set_value("Debtor Case", {"debtor": self.debtor, "name": ["!=", self.name]}, {"debtor_name": name, "debtor_cpr": cpr or None})

	def sync_latest_followup(self):
		rows = sorted(self.followups, key=lambda r: str(r.followup_date or ""))
		if rows:
			last = rows[-1]
			self.main_status = last.main_status or self.main_status
			self.sub_status = last.sub_status or self.sub_status
			self.remarks = last.remarks or self.remarks

	def compute_totals(self):
		if self.invoices:
			self.debt_total_amount = sum(flt(r.amount) for r in self.invoices)
		if self.discount_percentage:
			self.discount_amount = flt(self.debt_total_amount) * flt(self.discount_percentage) / 100
		self.debt_collected_amount = sum(flt(r.amount) for r in self.payments)
		last = max(self.payments, key=lambda r: (str(r.receipt_date or ""), r.idx), default=None)
		self.last_payment_amount = flt(last.amount) if last else 0
		self.last_payment_date = last.receipt_date if last else None
		self.debt_balance_amount = (
			flt(self.debt_total_amount) + flt(self.interest_judgment_amount) - flt(self.discount_amount) - flt(self.debt_adjustment_amount) - flt(self.debt_collected_amount)
		)
		if self.debt_balance_amount < -0.0005:
			frappe.throw("Payments + discount + adjustment are more than the claim amount plus interest")
		self.commission_amount = flt(self.debt_collected_amount) * flt(self.commission_percent) / 100
		self.net_payable_to_client = flt(self.debt_collected_amount) - flt(self.commission_amount)
		if flt(self.remitted_amount) > flt(self.net_payable_to_client) + 0.0005:
			frappe.throw("We have already paid the client more than their share of what was collected")
		self.payable_balance = flt(self.net_payable_to_client) - flt(self.remitted_amount)
		if self.payments and abs(self.debt_balance_amount) < 0.0005 and self.status not in ("Settled", "Closed", "Returned to Client"):
			self.status = "Settled"
		self.set_next_followup()

	def set_next_followup(self):
		dates = [r.promise_date for r in self.followups if r.promise_date]
		# a promise date only takes over when no future follow-up has been set by hand
		if dates and self.debt_balance_amount > 0 and (not self.next_followup_date or getdate(self.next_followup_date) < getdate(nowdate())):
			self.next_followup_date = max(dates)

	def update_schedule(self):
		"""Payments clear the schedule oldest-due-first; each row gets Paid / Partial / Overdue / Pending."""
		today = getdate(nowdate())
		# the schedule was built on the balance left after earlier payments, so only money received since then counts
		left = max(flt(self.debt_collected_amount) - flt(self.plan_paid_baseline), 0)
		for r in sorted(self.payment_schedule, key=lambda r: (str(r.due_date or ""), r.idx)):
			r.paid_amount = flt(min(flt(r.amount), left), 3)
			left = flt(left - r.paid_amount, 3)
			if r.paid_amount >= flt(r.amount) - 0.0005:
				r.status = "Paid"
			elif r.due_date and getdate(r.due_date) < today:
				r.status = "Overdue"
			else:
				r.status = "Partial" if r.paid_amount > 0 else "Pending"
		due = [getdate(r.due_date) for r in self.payment_schedule if r.status != "Paid" and r.due_date and getdate(r.due_date) >= today]
		if due and self.debt_balance_amount > 0 and (not self.next_followup_date or getdate(self.next_followup_date) < today):
			self.next_followup_date = min(due)

	def update_payable(self):
		self.payable_balance = flt(self.net_payable_to_client) - flt(self.remitted_amount)
		frappe.db.set_value("Debtor Case", self.name, "payable_balance", self.payable_balance)


def _own(case_owner_alias="dc"):
	"""SQL tail limiting a Debt Officer to their own cases; managers see all."""
	if sees_all():
		return ""
	return f" and {case_owner_alias}.owner = {frappe.db.escape(frappe.session.user)}"


@frappe.whitelist()
def get_dashboard(case, on_date=None):
	"""Everything the Summary / Debtor Cases / Log History widgets need in one round trip."""
	doc = frappe.get_doc("Debtor Case", case)
	doc.check_permission("read")
	on_date = getdate(on_date or nowdate())
	user = frappe.session.user
	settings = frappe.get_cached_doc("Debt Recovery Settings")

	cases = []
	if doc.debtor:
		cond = "dc.debtor = %(debtor)s"
		if not sees_all():
			cond += " and (dc.name = %(case)s or dc.owner = %(user)s)"
		cases = frappe.db.sql(
			f"""select dc.name, dc.account_no, dc.msisdn, dc.collector, dc.debt_total_amount claim, dc.debt_collected_amount payment,
				dc.debt_balance_amount balance, dc.debt_currency,
				(select max(p.receipt_date) from `tabDebt Payment` p where p.parent = dc.name and p.parenttype = 'Debtor Case') last_payment
			from `tabDebtor Case` dc where {cond} order by dc.creation desc""",
			{"debtor": doc.debtor, "case": case, "user": user},
			as_dict=True,
		)

	actions_today = frappe.db.sql(
		"""select count(*) from `tabDebt Followup` where parenttype='Debtor Case' and owner=%s and date(followup_date)=%s""", (user, on_date)
	)[0][0]
	paid_today = frappe.db.sql(
		"""select count(*), ifnull(sum(amount),0) from `tabDebt Payment` where parenttype='Debtor Case' and owner=%s and receipt_date=%s""",
		(user, on_date),
	)[0]
	month_start = on_date.replace(day=1)
	month_collected = frappe.db.sql(
		"""select ifnull(sum(amount),0) from `tabDebt Payment` where parenttype='Debtor Case' and owner=%s and receipt_date between %s and %s""",
		(user, month_start, on_date),
	)[0][0]

	return {
		"full_name": get_fullname(user),
		"cases": cases,
		"debtor_contact": (frappe.db.get_value("Debtor", doc.debtor, ["contact_no", "email"], as_dict=True) or {}) if doc.debtor else {},
		"daily_target": settings.daily_action_target or 0,
		"monthly_target": flt(settings.monthly_collection_target),
		"actions_today": actions_today,
		"payments_today": paid_today[0],
		"collected_today": flt(paid_today[1]),
		"month_collected": flt(month_collected),
		"log_count": frappe.db.count("Version", {"ref_doctype": "Debtor Case", "docname": case}),
		"today": str(getdate(nowdate())),
	}


@frappe.whitelist()
def get_log_history(case):
	frappe.get_doc("Debtor Case", case).check_permission("read")
	out = []
	for v in frappe.get_all("Version", filters={"ref_doctype": "Debtor Case", "docname": case}, fields=["owner", "creation", "data"], order_by="creation desc", limit=200):
		data = json.loads(v.data or "{}")
		parts = []
		for fn, old, new in data.get("changed", []):
			label = frappe.get_meta("Debtor Case").get_label(fn) or fn
			parts.append(f"{label} from {old if old not in (None, '') else '(blank)'} to {new if new not in (None, '') else '(blank)'}")
		for table in ("added", "removed"):
			for row in data.get(table, []):
				parts.append(f"{table} a row in {frappe.get_meta('Debtor Case').get_label(row[0]) or row[0]}")
		if parts:
			out.append({"user": v.owner, "creation": str(v.creation), "text": "; ".join(parts)})
	return out


@frappe.whitelist()
def save_debtor_details(debtor, values):
	values = frappe.parse_json(values)
	allowed = ("debtor_name", "cpr", "cr", "nationality", "occupation", "email", "passport_no", "flat_villa_no", "building", "road_no", "block_no", "contact_no", "remarks")
	doc = frappe.get_doc("Debtor", debtor)
	doc.update({k: v for k, v in values.items() if k in allowed})
	doc.save()
	return doc.as_dict()


@frappe.whitelist()
def add_followup(case, remarks, main_status=None, sub_status=None, ptp=0, promise_date=None, promise_amount=0, next_followup_date=None):
	doc = frappe.get_doc("Debtor Case", case)
	doc.append(
		"followups",
		{
			"followup_date": frappe.utils.now_datetime(),
			"collector": doc.collector,
			"main_status": main_status,
			"sub_status": sub_status,
			"ptp": int(ptp or 0),
			"promise_date": promise_date or None,
			"promise_amount": flt(promise_amount),
			"remarks": remarks,
		},
	)
	if next_followup_date:
		doc.next_followup_date = next_followup_date
	doc.save()
	if next_followup_date:  # validate() derives from PTP dates; an explicit date wins
		frappe.db.set_value("Debtor Case", case, "next_followup_date", next_followup_date)
	return doc.name


@frappe.whitelist()
def add_payment(case, amount, receipt_date=None, receipt_no=None, remarks=None):
	doc = frappe.get_doc("Debtor Case", case)
	doc.append("payments", {"receipt_date": receipt_date or nowdate(), "receipt_no": receipt_no, "amount": flt(amount), "remarks": remarks})
	doc.save()
	return doc.name


WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@frappe.whitelist()
def build_schedule(start_date, frequency, amount, balance, pay_on_day=1, pay_on_last_day=0, days=None):
	"""Instalment dates until the outstanding balance is covered; the last row takes the remainder."""
	amount, balance = flt(amount), flt(balance)
	if amount <= 0:
		frappe.throw("Enter the Installment Amount first")
	if balance <= 0:
		frappe.throw("Nothing is outstanding on this case")
	start = getdate(start_date or nowdate())
	picked = {WEEKDAYS.index(d) for d in (frappe.parse_json(days) if days else []) if d in WEEKDAYS}
	rows, d, left = [], start, balance
	while left > 0.0005 and len(rows) < 600:
		if frequency == "Daily":
			due = d
			d = d + timedelta(days=1)
		elif frequency == "Weekly":
			if picked:
				while d.weekday() not in picked:
					d += timedelta(days=1)
				due = d
				d += timedelta(days=1)
			else:
				due = d
				d += timedelta(days=7)
		else:  # Monthly
			last = calendar.monthrange(d.year, d.month)[1]
			day = last if int(pay_on_last_day or 0) else min(max(int(pay_on_day or 1), 1), last)
			due = d.replace(day=day)
			if due < start:  # this month's pay day already passed - start next month
				d = (d.replace(day=1) + timedelta(days=32)).replace(day=1)
				continue
			d = (d.replace(day=1) + timedelta(days=32)).replace(day=1)
		pay = min(amount, left)
		rows.append({"due_date": str(due), "amount": round(pay, 3)})
		left -= pay
	return rows
