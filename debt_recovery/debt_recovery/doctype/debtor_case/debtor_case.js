const API = "debt_recovery.debt_recovery.doctype.debtor_case.debtor_case.";
const STATUS_COLOR = { Open: "orange", "Under Tracing": "blue", "Promise to Pay": "yellow", "Payment Plan": "yellow", Settled: "green", "Returned to Client": "gray", Closed: "green" };
const MAIN_STATUS = ["Under Follow Up", "Promise to Pay", "Partial Payment", "Tracing Done 1", "Tracing Done Without Information", "Under Tracing", "Police Case", "Refuse to Pay", "No Answer", "Wrong Number", "Paid in Full", "Case Closed", "On Hold"];

const CSS = `
.dc-btn-log{background:#4f46e5!important;color:#fff!important;border:none!important}
.dc-btn-log .dc-count{background:#312e81;border-radius:10px;padding:0 7px;margin-left:5px;font-size:11px}
.dc-btn-pay{background:#166534!important;color:#fff!important;border:none!important}
.dc-sum{display:flex;flex-direction:column;gap:14px;padding:6px 2px 4px}
.dc-hero{border:1px solid #f1e3d3;background:linear-gradient(135deg,#fff7ed,#fff);border-radius:14px;padding:18px 22px;display:flex;gap:16px;align-items:flex-start}
.dc-avatar{width:58px;height:58px;border-radius:50%;background:#fde8d3;color:#b45309;font-weight:700;font-size:18px;display:flex;align-items:center;justify-content:center;flex:none}
.dc-hero h2{margin:0 0 4px;font-size:24px;font-weight:700;color:#3b2f2a;letter-spacing:.2px}
.dc-meta{font-size:12.5px;color:#57534e;display:flex;flex-wrap:wrap;gap:4px 16px;margin-bottom:10px}
.dc-meta b{color:#1c1917;font-weight:600}
.dc-chips{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:6px}
.dc-chip{border:1px solid #e0e7ff;background:#eef2ff;color:#3730a3;border-radius:999px;padding:3px 12px;font-size:12px;cursor:pointer;display:inline-flex;gap:8px;align-items:center}
.dc-chip.plain{cursor:default;background:#fff;border-color:#e7e5e4;color:#44403c}
.dc-chip.target{background:#eff6ff;border-color:#bfdbfe;color:#1d4ed8}
.dc-chip.pill-due{background:#dc2626;color:#fff;border-radius:999px;padding:1px 10px;font-weight:600}
.dc-chip.orange{background:#fff7ed;border-color:#fed7aa;color:#c2410c;font-weight:600}
.dc-chip.red{background:#fef2f2;border-color:#fecaca;color:#b91c1c;font-weight:600}
.dc-dot{width:8px;height:8px;border-radius:50%;background:#f97316;display:inline-block}
.dc-act{border:1.5px solid #f0abfc;background:linear-gradient(90deg,#fdf2f8,#fff);border-radius:14px;padding:16px 22px;display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.dc-ring{width:54px;height:54px;flex:none}
.dc-act .t1{font-size:12px;font-weight:600;color:#44403c}
.dc-act .t2{font-size:20px;font-weight:700;color:#1c1917}
.dc-act .t2 small{font-size:13px;font-weight:500;color:#57534e}
.dc-bar{height:6px;border-radius:6px;background:#f5d0e6;margin:6px 0;overflow:hidden;width:340px;max-width:100%}
.dc-bar i{display:block;height:100%;background:#db2777}
.dc-act .t3{font-size:12.5px;font-weight:600;color:#be185d}
.dc-act .mid{flex:1;min-width:260px}
.dc-act .right{border-left:1px solid #f5d0e6;padding-left:22px;min-width:210px}
.dc-act .right .lbl{font-size:12px;color:#57534e}.dc-act .right .amt{font-size:21px;font-weight:700;color:#15803d}.dc-act .right .sub{font-size:12px;color:#57534e}
.dc-act .date{margin-left:auto;display:flex;gap:8px;align-items:center}
.dc-act .date input{border:1px solid #e7e5e4;border-radius:8px;padding:3px 8px;font-size:12.5px;background:#fff}
.dc-act .date a{cursor:pointer;color:#57534e}
.dc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.dc-grid.two{grid-template-columns:minmax(0,2fr) minmax(0,1.1fr)}
@media(max-width:900px){.dc-grid,.dc-grid.two{grid-template-columns:1fr}}
.dc-card{background:#fff;border:1.5px solid #c7d2fe;border-top-width:3px;border-radius:14px;padding:16px 18px;min-height:150px}
.dc-card.blue{border-color:#bfdbfe;border-top-color:#2563eb}.dc-card.indigo{border-color:#c7d2fe;border-top-color:#4f46e5}.dc-card.teal{border-color:#99f6e4;border-top-color:#0d9488}
.dc-card.purple{border-color:#e9d5ff;border-top-color:#7c3aed}.dc-card.amber{border-color:#fed7aa;border-top-color:#f59e0b}
.dc-card h4{margin:0 0 12px;font-size:13.5px;font-weight:600;color:#292524;display:flex;gap:10px;align-items:center}
.dc-ico{width:26px;height:26px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;background:#eef2ff;color:#4f46e5;font-size:13px}
.dc-ico.teal{background:#ccfbf1;color:#0f766e}.dc-ico.blue{background:#dbeafe;color:#1d4ed8}.dc-ico.purple{background:#ede9fe;color:#6d28d9}.dc-ico.amber{background:#ffedd5;color:#c2410c}
.dc-bal{display:flex;align-items:center;gap:18px}
.dc-donut{width:100px;height:100px;flex:none;position:relative}
.dc-donut .pct{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:700;font-size:20px;color:#292524}
.dc-donut .pct small{font-weight:400;font-size:11px;color:#57534e}
.dc-lines{flex:1;font-size:12.5px;color:#44403c}
.dc-lines b,.dc-lines .duebox{flex-direction:column;gap:2px}.dc-lines .k{white-space:nowrap}.dc-lines .due{white-space:nowrap}.dc-lines div{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;align-items:flex-start}
.dc-lines .k:before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:7px;background:var(--c)}
.dc-lines .duebox{flex-direction:column;gap:2px}.dc-lines .k{white-space:nowrap}.dc-lines .due{font-size:21px;font-weight:700;color:#dc2626}
.dc-follow .big{font-size:21px;font-weight:700;color:#475569;margin-bottom:10px}.dc-follow .big.late{color:#dc2626}.dc-follow .big.ok{color:#15803d}
.dc-follow .hint{font-size:12.5px;color:#64748b;margin-bottom:12px}
.dc-slider{position:relative;height:6px;background:#fecaca;border-radius:6px;margin:6px 0 14px}.dc-slider i{position:absolute;right:0;top:-4px;width:14px;height:14px;border-radius:50%;background:#dc2626;border:2px solid #fff;box-shadow:0 0 0 1px #dc2626}
.dc-follow .row{display:flex;justify-content:space-between;font-size:12.5px;color:#475569;margin-bottom:4px}
.dc-follow .last{background:#f8fafc;border-radius:10px;padding:10px 14px;display:flex;justify-content:space-between;font-size:12.5px;color:#475569;margin-top:12px}
.dc-follow .last b{color:#0f172a}
.dc-reach .item{display:flex;gap:12px;align-items:center;margin-bottom:12px}.dc-reach .item .ph{width:36px;height:36px;border-radius:50%;background:#ccfbf1;display:flex;align-items:center;justify-content:center;color:#0f766e}
.dc-reach .item .k{font-size:11px;color:#57534e}.dc-reach .item .v{font-size:15px;font-weight:600;color:#1c1917}.dc-reach .copy{margin-left:auto;font-size:12px;color:#334155;cursor:pointer;font-weight:600}
.dc-reach .none{font-size:12.5px;color:#64748b}
.dc-tiles{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
@media(max-width:900px){.dc-tiles{grid-template-columns:repeat(2,1fr)}}
.dc-tile{border-radius:10px;padding:9px 12px;border:1px solid var(--b);background:var(--bg);min-height:56px}
.dc-tile .k{font-size:11.5px;color:var(--fg);font-weight:500}.dc-tile .v{font-size:15px;font-weight:600;color:#1f2937;word-break:break-word}
.dc-quote{background:#fff7ed;border-radius:10px;padding:14px 16px;font-size:15px;color:#292524;position:relative}
.dc-quote:before{content:"\\201C";position:absolute;left:12px;top:-4px;font-size:30px;color:#fdba74}
.dc-quote span{display:block;margin-left:14px;white-space:pre-wrap}
.dc-by{display:flex;gap:8px;align-items:center;font-size:12.5px;color:#44403c;margin-top:12px}.dc-by i{width:20px;height:20px;border-radius:50%;background:#ffedd5;color:#c2410c;font-style:normal;font-size:11px;font-weight:600;display:inline-flex;align-items:center;justify-content:center}
.dc-table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:6px}
.dc-table th{background:#2f2f2f;color:#fff;text-align:left;padding:10px 12px;font-weight:700;vertical-align:middle}
.dc-table td{padding:10px 12px;border-bottom:1px solid #ececec;vertical-align:top}
.dc-table tr:nth-child(even) td{background:#f3f3f3}
.dc-table tr.total td{background:#ececec;font-weight:700}
.dc-table.light th{background:#fff;color:#171717;border-bottom:1px solid #e5e5e5;font-weight:700}
.dc-table.light td{border-bottom:none}
.dc-table.light tr:nth-child(odd) td{background:#f3f3f3}.dc-table.light tr:nth-child(even) td{background:#fff}
.dc-banner{display:flex;gap:12px;align-items:center;justify-content:space-between}
.dc-banner .x{cursor:pointer;font-size:18px;line-height:1;color:#7f1d1d;opacity:.7}
.dc-banner .btn-show{background:#dc3545;color:#fff;border:none;border-radius:6px;padding:2px 9px;font-size:12px;font-weight:600;margin-left:6px}
.dc-actions{display:flex;gap:8px;margin-top:8px}.dc-add{background:#171717;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:12px;font-weight:600}.dc-more{background:#1ba1c5;color:#fff;border:none;border-radius:6px;padding:5px 12px;font-size:12px;font-weight:600}
`;

frappe.ui.form.on("Debt Invoice", {
	amount: (frm) => sync_invoice_total(frm),
	invoices_remove: (frm) => sync_invoice_total(frm),
});

function sync_invoice_total(frm) {
	if ((frm.doc.invoices || []).length) {
		frm.set_value("debt_total_amount", frm.doc.invoices.reduce((a, r) => a + flt(r.amount), 0));
	}
}

frappe.ui.form.on("Debtor Case", {
	invoices_remove: (frm) => sync_invoice_total(frm),
	setup(frm) {
		frappe.dom.set_style(CSS, "debtor-case-css");
		frm.set_query("collector", () => ({ filters: { enabled: 1, is_group: 0 } }));
	},

	onload(frm) {
		if (frm.is_new() && !frm.doc.commission_percent && frm.doc.client) frm.trigger("client");
	},

	debtor(frm) {
		if (!frm.doc.debtor) return;
		frappe.db.get_value("Debtor", frm.doc.debtor, ["debtor_name", "cpr", "email", "remarks"]).then((r) => {
			frm.set_value("debtor_name", r.message.debtor_name);
			frm.set_value("debtor_cpr", r.message.cpr);
			frm.set_value("debtor_email", r.message.email);
			frm.set_value("debtor_remark", r.message.remarks);
		});
	},

	client(frm) {
		frm.set_value("client_name", frm.doc.client || "");
		frm.trigger("load_commission_plans").then(() => {
			const first = (frm.dc_plans || [])[0];
			if (first) {
				frm.set_value("commission_plan", first.commission_name);
				frm.set_value("commission_percent", first.commission_percent);
			}
		});
	},

	commission_plan(frm) {
		const p = (frm.dc_plans || []).find((x) => x.commission_name === frm.doc.commission_plan);
		if (p) frm.set_value("commission_percent", p.commission_percent);
	},

	async load_commission_plans(frm) {
		frm.dc_plans = [];
		if (frm.doc.client) {
			const r = await frappe.call({ method: "frappe.client.get", args: { doctype: "Recovery Client", name: frm.doc.client } }).catch(() => null);
			frm.dc_plans = (r && r.message && r.message.commissions) || [];
		}
		frm.set_df_property("commission_plan", "options", frm.dc_plans.map((x) => x.commission_name));
		frm.refresh_field("commission_plan");
	},

	refresh(frm) {
		frm.trigger("load_commission_plans");
		frm.trigger("render_empty_states");
		if (frm.is_new()) {
			// unsaved: render the same layout from the form values, no server data yet
			frm.dc = { full_name: frappe.user.full_name(), cases: [], daily_target: 0, monthly_target: 0, actions_today: 0, payments_today: 0, collected_today: 0, month_collected: 0, today: frappe.datetime.get_today() };
			frm.trigger("render_cases");
			frm.trigger("render_history");
			frm.trigger("render_payments");
			frappe.db.get_single_value("Debt Recovery Settings", "daily_action_target").then((t) => {
				frm.dc.daily_target = t || 0;
				frm.trigger("render_summary");
			});
			return;
		}
		frm.trigger("add_buttons");
		frm.trigger("render_priority");
		frm.trigger("render_banner");
		frm.trigger("render_history");
		frm.trigger("render_payments");
		frm.trigger("load_dashboard");
	},

	debtor_name: (frm) => frm.is_new() && frm.dc && frm.trigger("render_summary"),
	collector: (frm) => frm.is_new() && frm.dc && frm.trigger("render_summary"),
	case_type: (frm) => frm.is_new() && frm.dc && frm.trigger("render_summary"),
	debt_total_amount: (frm) => frm.trigger("recalc"),
	discount_percentage: (frm) => frm.trigger("recalc"),
	discount_amount: (frm) => frm.trigger("recalc"),
	debt_adjustment_amount: (frm) => frm.trigger("recalc"),
	interest_judgment_amount: (frm) => frm.trigger("recalc"),

	generate_schedule(frm) {
		const d = frm.doc;
		frappe.call({
			method: API + "build_schedule",
			args: { start_date: d.plan_start_date, frequency: d.frequency, amount: d.amount, balance: d.debt_balance_amount, pay_on_day: d.pay_on_day, pay_on_last_day: d.pay_on_last_day, days: JSON.stringify((d.pay_on_days || []).map((r) => r.day)) },
		}).then((r) => {
			frm.set_value("plan_paid_baseline", flt(frm.doc.debt_collected_amount));
			frm.clear_table("payment_schedule");
			(r.message || []).forEach((row) => frm.add_child("payment_schedule", row));
			frm.refresh_field("payment_schedule");
			frm.dirty();
			frappe.show_alert({ message: __("{0} installments generated – Save to keep them", [(r.message || []).length]), indicator: "green" });
		});
	},
	recalc(frm) {
		const d = frm.doc;
		if (flt(d.discount_percentage)) frm.doc.discount_amount = (flt(d.debt_total_amount) * flt(d.discount_percentage)) / 100;
		frm.doc.debt_balance_amount = flt(d.debt_total_amount) + flt(d.interest_judgment_amount) - flt(frm.doc.discount_amount) - flt(d.debt_adjustment_amount) - flt(d.debt_collected_amount);
		frm.refresh_fields(["discount_amount", "debt_balance_amount"]);
		if (frm.is_new() && frm.dc) frm.trigger("render_summary");
	},

	render_empty_states(frm) {
		const hide = (f) => $(frm.fields_dict[f].wrapper).find(".control-label").hide();
		["summary_html", "debtor_cases_html", "history_html", "payment_history_html"].forEach(hide);
	},

	add_buttons(frm) {
		const log = frm.add_custom_button(`${__("Log History")} <span class="dc-count">${frm.dc_log_count ?? ""}</span>`, () => frm.trigger("show_log"));
		log.addClass("dc-btn-log").html(`<svg class="icon icon-sm" style="margin-right:4px"><use href="#icon-small-file"></use></svg>${__("Log History")} <span class="dc-count">${frm.dc_log_count ?? ""}</span>`);
		frm.add_custom_button(__("Payment History"), () => frm.trigger("goto_payments")).addClass("dc-btn-pay");

		// Print Now: pick which letter to print
		const PN = __("Print Now");
		["Demand Notice", "Payment Reminder"].forEach((fmt) =>
			frm.add_custom_button(__(fmt), () => frm.events.print_letter(frm, fmt), PN)
		);

		const A = __("Actions");
		frm.add_custom_button(__("Add Follow-up / Remark"), () => frm.trigger("follow_dialog"), A);
		frm.add_custom_button(__("Add Payment"), () => frm.trigger("payment_dialog"), A);
		frm.add_custom_button(__("Set Priority"), () => frm.trigger("priority_dialog"), A);
		frm.add_custom_button(__("Creditor (Client)"), () => frappe.set_route("Form", "Recovery Client", frm.doc.client), A);
		if (frm.doc.payable_balance > 0) frm.add_custom_button(__("Pay Client"), () => frm.trigger("pay_client"), A);
	},

	pay_client(frm) {
		// pre-fill a remittance with what we still owe the client on THIS case
		frappe.model.with_doctype("Client Remittance", () => {
			const doc = frappe.model.get_new_doc("Client Remittance");
			doc.client = frm.doc.client;
			const row = frappe.model.add_child(doc, "Client Remittance Item", "items");
			Object.assign(row, { debtor_case: frm.doc.name, debtor_name: frm.doc.debtor_name, available: frm.doc.payable_balance, amount: frm.doc.payable_balance });
			frappe.set_route("Form", "Client Remittance", doc.name);
		});
	},

	print_letter(frm, fmt) {
		if (frm.is_dirty()) return frappe.msgprint(__("Save the case first so the letter shows the latest details."));
		const url = `/printview?doctype=${encodeURIComponent(frm.doctype)}&name=${encodeURIComponent(frm.doc.name)}&format=${encodeURIComponent(fmt)}&no_letterhead=1&trigger_print=1`;
		window.open(frappe.urllib.get_full_url(url), "_blank");
	},

	goto_payments(frm) {
		const tab = frm.layout.tabs.find((t) => t.df.fieldname === "tab_payments");
		tab && tab.set_active();
		frm.scroll_to_field && frm.scroll_to_field("payment_history_html");
	},

	render_priority(frm) {
		frm.page.set_indicator(__(frm.doc.status), STATUS_COLOR[frm.doc.status] || "gray");
		$(frm.page.wrapper).find(".title-area .dc-priority").remove();
		const p = frm.doc.priority || "Low";
		const col = { Low: "gray", Medium: "orange", High: "red" }[p];
		$(frm.page.wrapper).find(".title-area .indicator-pill").last().after(`<span class="dc-priority indicator-pill whitespace-nowrap ${col}"><span>${__(p)} ${__("Priority")}</span></span>`);
	},

	priority_dialog(frm) {
		const d = new frappe.ui.Dialog({
			title: __("Set Priority"),
			fields: [{ fieldname: "priority", fieldtype: "Select", label: __("Priority"), options: "Low\nMedium\nHigh", default: frm.doc.priority || "Low", reqd: 1 }],
			primary_action_label: __("Set"),
			primary_action(v) {
				frm.set_value("priority", v.priority);
				d.hide();
				frm.save();
			},
		});
		d.show();
	},

	render_banner(frm) {
		const d = frm.doc;
		frm.dashboard.set_headline_alert(
			`<div class="dc-banner"><div><div>${__("Client")}: <b>${frappe.utils.escape_html(d.client_name || d.client || "–")}</b></div>
			<div>${__("Debtor")}: <b>${frappe.utils.escape_html(d.debtor_name || "")}${d.debtor_cpr ? ` (${frappe.utils.escape_html(d.debtor_cpr)})` : ""}</b>
			<button class="btn-show" data-act="details">${__("Show Details")}</button></div></div></div>`,
			"red"
		);
		$(frm.wrapper).off("click.dcdetails").on("click.dcdetails", "[data-act=details]", () => frm.trigger("debtor_dialog"));
	},

	debtor_dialog(frm) {
		if (!frm.doc.debtor) return frappe.msgprint(__("Save the case first - the debtor is created from the Debtor Name when you save."));
		frappe.db.get_doc("Debtor", frm.doc.debtor).then((deb) => {
			const f = (fieldname, label, extra = {}) => ({ fieldname, label: __(label), fieldtype: "Data", default: deb[fieldname], ...extra });
			const d = new frappe.ui.Dialog({
				title: __("Debtor Details"),
				fields: [
					f("debtor_name", "Debtor Name", { reqd: 1 }), f("cpr", "CPR"), f("cr", "CR"), f("nationality", "Nationality"), f("occupation", "Occupation"),
					f("email", "Email", { options: "Email" }), f("passport_no", "Passport No"),
					{ fieldtype: "Column Break" },
					f("flat_villa_no", "Flat/Villa No"), f("building", "Building"), f("road_no", "Road No."), f("block_no", "Block No."),
					f("contact_no", "Contact No", { options: "Phone" }), { fieldname: "remarks", label: __("Remarks"), fieldtype: "Small Text", default: deb.remarks },
				],
				primary_action_label: __("Save Debtor Details"),
				primary_action(v) {
					frappe.call({ method: API + "save_debtor_details", args: { debtor: frm.doc.debtor, values: v }, freeze: true }).then(() => {
						d.hide();
						frappe.show_alert({ message: __("Debtor details saved"), indicator: "green" });
						frm.reload_doc();
					});
				},
			});
			d.show();
		});
	},

	follow_dialog(frm) {
		const d = new frappe.ui.Dialog({
			title: __("Add Follow-up / Remark"),
			fields: [
				{ fieldname: "main_status", fieldtype: "Select", label: __("Main Status"), options: ["", ...MAIN_STATUS].join("\n"), default: frm.doc.main_status },
				{ fieldname: "sub_status", fieldtype: "Data", label: __("Sub Status") },
				{ fieldtype: "Column Break" },
				{ fieldname: "ptp", fieldtype: "Check", label: __("Promise to Pay (PTP)") },
				{ fieldname: "promise_date", fieldtype: "Date", label: __("PTP Date"), depends_on: "ptp", mandatory_depends_on: "ptp" },
				{ fieldname: "promise_amount", fieldtype: "Currency", label: __("PTP Amount"), depends_on: "ptp", options: frm.doc.debt_currency },
				{ fieldtype: "Section Break" },
				{ fieldname: "next_followup_date", fieldtype: "Date", label: __("Next Follow-up Date") },
				{ fieldname: "remarks", fieldtype: "Small Text", label: __("Remark"), reqd: 1 },
			],
			primary_action_label: __("Add"),
			primary_action(v) {
				frappe.call({ method: API + "add_followup", args: { case: frm.doc.name, ...v }, freeze: true }).then(() => {
					d.hide();
					frm.reload_doc();
				});
			},
		});
		d.show();
	},

	payment_dialog(frm) {
		const d = new frappe.ui.Dialog({
			title: __("Add Payment"),
			fields: [
				{ fieldname: "amount", fieldtype: "Currency", label: __("Amount"), reqd: 1, options: frm.doc.debt_currency },
				{ fieldname: "receipt_date", fieldtype: "Date", label: __("Receipt Date"), default: frappe.datetime.get_today(), reqd: 1 },
				{ fieldname: "receipt_no", fieldtype: "Data", label: __("Receipt No.") },
				{ fieldname: "remarks", fieldtype: "Small Text", label: __("Remarks") },
			],
			primary_action_label: __("Add Payment"),
			primary_action(v) {
				frappe.call({ method: API + "add_payment", args: { case: frm.doc.name, ...v }, freeze: true }).then(() => {
					d.hide();
					frm.reload_doc();
				});
			},
		});
		d.show();
	},

	show_log(frm) {
		frappe.call({ method: API + "get_log_history", args: { case: frm.doc.name } }).then((r) => {
			const rows = r.message || [];
			const html = rows.length
				? rows.map((x) => `<div style="padding:8px 0;border-bottom:1px solid #eee;font-size:13px"><b>${frappe.utils.escape_html(x.user)}</b> ${__("changed the value of")} ${frappe.utils.escape_html(x.text)} · <span class="text-muted">${frappe.datetime.prettyDate(x.creation)}</span></div>`).join("")
				: `<div class="text-muted">${__("No changes recorded yet")}</div>`;
			frappe.msgprint({ title: __("Log History"), message: `<div style="max-height:60vh;overflow:auto">${html}</div>`, wide: true });
		});
	},

	// ---------- Summary ----------
	load_dashboard(frm, on_date) {
		// frm.trigger() passes (doctype, name) as extra args - only accept a real date
		if (!/^\d{4}-\d{2}-\d{2}$/.test(on_date || "")) on_date = undefined;
		frappe.call({ method: API + "get_dashboard", args: { case: frm.doc.name, on_date } }).then((r) => {
			frm.dc = r.message;
			frm.dc.on_date = on_date;
			frm.dc_log_count = r.message.log_count;
			$(frm.page.wrapper).find(".dc-btn-log .dc-count").text(r.message.log_count);
			frm.trigger("render_summary");
			frm.trigger("render_cases");
		});
	},

	render_summary(frm) {
		const d = frm.doc, s = frm.dc, e = frappe.utils.escape_html;
		const cur = d.debt_currency, money = (v) => format_currency(flt(v), cur, 3);
		const initials = (d.debtor_name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
		const others = (s.cases || []).filter((c) => c.name !== d.name);
		const due_total = (s.cases || []).reduce((a, c) => a + flt(c.balance), 0);
		const claim = flt(d.debt_total_amount), paid = flt(d.debt_collected_amount);
		const pct = claim ? Math.min(100, Math.round((paid / claim) * 100)) : 0;
		const target = cint(s.daily_target), acts = cint(s.actions_today);
		const apct = target ? Math.min(100, Math.round((acts / target) * 100)) : 0;
		const ring = (p, col, bg, r = 22, w = 6, size = 54) => {
			const c = 2 * Math.PI * r;
			return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${bg}" stroke-width="${w}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="${p ? "round" : "butt"}" stroke-dasharray="${(c * p) / 100} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
		};
		const rows = d.followups || [];
		const last = rows.slice().sort((a, b) => String(a.followup_date).localeCompare(String(b.followup_date))).pop();
		const lastpay = (d.payments || []).slice().sort((a, b) => String(a.receipt_date).localeCompare(String(b.receipt_date))).pop();

		// follow-up card
		let follow;
		const lastaction = `<div class="row"><span>${__("Last action")}</span></div><div class="row"><b>${last ? e(last.main_status || __("Follow-up")) : "–"}</b></div><div class="row"><span>${last ? frappe.datetime.prettyDate(last.followup_date) : __("Not available")}</span></div>`;
		const lastpaybox = `<div class="last"><span>${__("Last payment")}</span><b>${lastpay ? `${money(lastpay.amount)} · ${frappe.datetime.str_to_user(lastpay.receipt_date)}` : __("None recorded")}</b></div>`;
		const nextinst = (d.payment_schedule || []).filter((r) => r.status !== "Paid").sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))[0];
		const instrow = nextinst ? `<div class="row"><span>${__("Next installment")}</span><b>${money(flt(nextinst.amount) - flt(nextinst.paid_amount))} · ${frappe.datetime.str_to_user(nextinst.due_date)}</b></div>` : "";
		if (d.next_followup_date) {
			const diff = frappe.datetime.get_day_diff(d.next_followup_date, frappe.datetime.get_today());
			const late = diff < 0;
			follow = `<div class="big ${late ? "late" : "ok"}">${late ? __("Overdue by {0} days", [-diff]) : diff === 0 ? __("Due today") : __("Due in {0} days", [diff])}</div>
				${late ? `<div class="dc-slider"><i></i></div>` : ""}<div class="row"><span>${__("Next follow-up")}</span><b>${frappe.datetime.str_to_user(d.next_followup_date)}</b></div>${instrow}${lastaction}${lastpaybox}`;
		} else {
			follow = `<div class="big">${__("No follow-up scheduled")}</div><div class="hint">${__("Set a next follow-up date to track this case.")}</div>${instrow}${lastaction}${lastpaybox}`;
		}

		const phones = [], dc = s.debtor_contact || {};
		if (d.msisdn) phones.push(["MSISDN", d.msisdn]);
		if (dc.contact_no && dc.contact_no !== d.msisdn) phones.push([__("Contact No"), dc.contact_no]);
		if (dc.email) phones.push([__("Email"), dc.email]);
		(d.debtor_info || []).filter((r) => ["Phone", "WhatsApp", "Email"].includes(r.contact_type)).forEach((r) => phones.push([r.contact_type + (r.remarks ? " · " + r.remarks : ""), r.value]));
		const reach = phones.length
			? phones.map(([k, v]) => `<div class="item"><span class="ph">&#9742;</span><div><div class="k">${k}</div><div class="v">${e(v)}</div></div><span class="copy" data-copy="${e(v)}">${__("Copy")}</span></div>`).join("")
			: `<div class="none">${__("No phone numbers or email on this case yet.")}</div>`;

		const tile = (k, v, c) => `<div class="dc-tile" style="--b:${c[0]};--bg:${c[1]};--fg:${c[2]}"><div class="k">${__(k)}</div><div class="v">${e(v || "–")}</div></div>`;
		const tiles = [
			tile("CPR", d.debtor_cpr, ["#ddd6fe", "#f5f3ff", "#6d28d9"]), tile("Individual BAN", d.individual_ban, ["#bae6fd", "#f0f9ff", "#0369a1"]),
			tile("Plan", d.plan, ["#bbf7d0", "#f0fdf4", "#15803d"]), tile("Nationality", d.nationality, ["#e9d5ff", "#faf5ff", "#7e22ce"]),
			tile("Aging", d.aging, ["#bbf7d0", "#f0fdf4", "#15803d"]), tile("Debtor status", d.debtor_status, ["#fed7aa", "#fff7ed", "#c2410c"]),
			tile("Debtor type", d.debtor_type, ["#fecaca", "#fef2f2", "#b91c1c"]),
		].join("");

		const remark = d.remarks || (last && last.remarks);
		const by = last ? last.by || last.owner : null;
		const remarks_card = remark
			? `<div class="dc-quote"><span>${e(remark)}</span></div>${last ? `<div class="dc-by"><i>${e((by || "?")[0].toUpperCase())}</i>${e(by || "")}, ${frappe.datetime.prettyDate(last.followup_date)}</div>` : ""}`
			: `<div class="text-muted" style="font-size:12.5px">${__("No remarks yet.")}</div>`;

		const status_chip = d.main_status ? `<span class="dc-chip orange"><span class="dc-dot"></span>${e(d.main_status)}</span>` : "";
		const type_chip = d.case_type === "Amicable" ? `<span class="dc-chip plain">${e(d.case_type)}</span>` : `<span class="dc-chip red">${e(d.case_type)}</span>`;

		const html = `<div class="dc-sum">
		<div class="dc-hero"><div class="dc-avatar">${e(initials)}</div><div style="flex:1;min-width:0">
			<h2>${e(d.debtor_name || "")}</h2>
			<div class="dc-meta"><span>${__("Case")} <b>${frm.is_new() ? __("Not saved") : e(d.name)}</b></span><span>${__("Client")} <b>${e(d.client_name || d.client || "–")}</b></span><span>${__("Agent")} <b>${e(d.collector || "–")}</b></span></div>
			<div class="dc-chips">${others.length ? `<span class="dc-chip" data-go="debtor">${__("{0} cases for this debtor", [others.length + 1])} <span class="dc-chip pill-due">${money(due_total)} ${__("due in total")}</span> &rsaquo;</span>` : `<span class="dc-chip plain">${__("No other cases for this debtor")}</span>`}
			<span class="dc-chip target" data-go="target"><svg class="icon icon-sm"><use href="#icon-small-file"></use></svg>${__("Monthly target")} &rsaquo;</span></div>
			<div class="dc-chips">${status_chip}${type_chip}<span class="dc-chip plain">${e(d.status)}</span><span class="dc-chip plain">${__(d.priority || "Low")} ${__("Priority")}</span></div>
		</div></div>

		<div class="dc-act"><div class="dc-ring">${ring(apct, "#db2777", "#fbcfe8")}</div>
			<div class="mid"><div class="t1">${__("My actions today")}, ${e(s.full_name)}</div><div class="t2">${acts} <small>${__("of")} ${target}</small></div>
			<div class="dc-bar"><i style="width:${apct}%"></i></div>
			<div class="t3">${acts >= target && target ? __("Target reached – great work!") : __("Let's go! {0} actions to hit today's target.", [Math.max(target - acts, 0)])}</div></div>
			<div class="right"><div class="lbl">${__("Collected today")}</div><div class="amt">${money(s.collected_today)}</div><div class="sub">${s.payments_today} ${__("payments")}</div></div>
			<div class="date"><input type="date" value="${s.on_date || s.today}"><a data-go="refresh" title="${__("Refresh")}">&#8635;</a></div>
		</div>

		<div class="dc-grid">
			<div class="dc-card indigo"><h4><span class="dc-ico">&#9707;</span>${__("Balance")}</h4>
				<div class="dc-bal"><div class="dc-donut">${ring(pct, "#16a34a", "#fecaca", 41, 9, 100)}<div class="pct">${pct}%<small>${__("collected")}</small></div></div>
				<div class="dc-lines"><div><span class="k" style="--c:#4f46e5">${__("Claim amount")}</span><b>${money(claim)}</b></div><div><span class="k" style="--c:#16a34a">${__("Collected")}</span><b style="color:#16a34a">${money(paid)}</b></div><div class="duebox"><span class="k" style="--c:#dc2626">${__("Balance due")}</span><span class="due">${money(d.debt_balance_amount)}</span></div></div></div></div>
			<div class="dc-card blue dc-follow"><h4><span class="dc-ico blue">&#128197;</span>${__("Follow-up")}</h4>${follow}</div>
			<div class="dc-card teal dc-reach"><h4><span class="dc-ico teal">&#9742;</span>${__("Reach the debtor")}</h4>${reach}</div>
		</div>

		<div class="dc-grid two">
			<div class="dc-card purple"><h4><span class="dc-ico purple">&#9638;</span>${__("Account")}</h4><div class="dc-tiles">${tiles}</div></div>
			<div class="dc-card amber"><h4><span class="dc-ico amber">&#128196;</span>${__("Latest remarks")}</h4>${remarks_card}</div>
		</div></div>`;

		const $w = $(frm.fields_dict.summary_html.wrapper).html(html);
		$w.find("[data-copy]").on("click", function () {
			frappe.utils.copy_to_clipboard($(this).data("copy"));
		});
		$w.find("[data-go=debtor]").on("click", () => frappe.set_route("List", "Debtor Case", { debtor: d.debtor }));
		$w.find("[data-go=target]").on("click", () => frm.trigger("target_dialog"));
		$w.find("[data-go=refresh]").on("click", () => frm.trigger("load_dashboard"));
		$w.find(".dc-act input[type=date]").on("change", function () {
			frm.dc.on_date = this.value;
			frm.events.load_dashboard(frm, this.value);
		});
	},

	target_dialog(frm) {
		const s = frm.dc, money = (v) => format_currency(flt(v), frm.doc.debt_currency, 3);
		const t = flt(s.monthly_target), got = flt(s.month_collected);
		const msg = t
			? `<div style="font-size:14px">${__("Collected this month")}: <b>${money(got)}</b> / ${money(t)} (${Math.min(100, Math.round((got / t) * 100))}%)<div class="dc-bar" style="width:100%;margin-top:10px"><i style="width:${Math.min(100, (got / t) * 100)}%"></i></div><div class="text-muted">${__("Remaining")}: ${money(Math.max(t - got, 0))}</div></div>`
			: `<div>${__("No monthly target is set. A manager can set it in Debt Recovery Settings.")}</div>`;
		frappe.msgprint({ title: __("Monthly target – {0}", [s.full_name]), message: msg });
	},

	// ---------- Debtor Cases (Case Details tab) ----------
	render_cases(frm) {
		const cases = frm.dc.cases || [], money = (v, c) => format_currency(flt(v), c || frm.doc.debt_currency, 3);
		const e = frappe.utils.escape_html;
		let tc = 0, tp = 0, tb = 0;
		const body = cases.map((c, i) => {
			tc += flt(c.claim); tp += flt(c.payment); tb += flt(c.balance);
			return `<tr><td>${i + 1}</td><td><a href="/app/debtor-case/${encodeURIComponent(c.name)}">${e(c.name)}</a></td><td>${e(c.account_no || "")}</td><td>${e(c.msisdn || "")}</td><td>${e(c.collector || "")}</td><td>${flt(c.claim, 3)}</td><td>${c.last_payment ? frappe.datetime.str_to_user(c.last_payment) : ""}</td><td>${flt(c.payment, 3)}</td><td>${flt(c.balance, 3)}</td></tr>`;
		}).join("");
		$(frm.fields_dict.debtor_cases_html.wrapper).html(
			`<table class="dc-table"><thead><tr><th>#</th><th>${__("Case Reference")}</th><th>${__("Account Number")}</th><th>MSISDN</th><th>${__("Collector")}</th><th>${__("Claim Amount")}</th><th>${__("Last Payment Date")}</th><th>${__("Payment")}</th><th>${__("Balance")}</th></tr></thead><tbody>${body}
			<tr class="total"><td>T</td><td></td><td></td><td></td><td></td><td>${flt(tc, 3)}</td><td></td><td>${flt(tp, 3)}</td><td>${flt(tb, 3)}</td></tr></tbody></table>`
		);
	},

	// ---------- Case History (paged) ----------
	render_history(frm, shown) {
		const PAGE = 5, e = frappe.utils.escape_html;
		shown = typeof shown === "number" ? shown : frm.dc_hist_shown || PAGE;
		frm.dc_hist_shown = shown;
		const rows = (frm.doc.followups || []).slice().sort((a, b) => String(b.followup_date).localeCompare(String(a.followup_date)));
		const body = rows.slice(0, shown).map((r, i) => `<tr><td>${i + 1}</td><td>${frappe.datetime.str_to_user(r.followup_date)}</td><td>${e(r.collector || "")}</td><td>${e(r.main_status || "")}</td><td>${r.ptp ? 1 : 0}</td><td>${e(r.remarks || "")}</td></tr>`).join("");
		const $w = $(frm.fields_dict.history_html.wrapper).html(
			`<table class="dc-table light"><thead><tr><th>#</th><th>${__("Creation Date")}</th><th>${__("Collector")}</th><th>${__("Main Status")}</th><th>PTP</th><th>${__("Remark")}</th></tr></thead><tbody>${body}</tbody></table>
			<div class="dc-actions">${frm.is_new() ? "" : `<button class="dc-add">+ ${__("Add Case History")}</button>`}${rows.length > shown ? `<button class="dc-more">${__("Load More")}</button>` : ""}</div>`
		);
		$w.find(".dc-add").on("click", () => frm.trigger("follow_dialog"));
		$w.find(".dc-more").on("click", () => frm.events.render_history(frm, shown + PAGE));
	},

	// ---------- Payment History ----------
	render_payments(frm) {
		const e = frappe.utils.escape_html, cur = frm.doc.debt_currency;
		let bal = flt(frm.doc.debt_total_amount) - flt(frm.doc.discount_amount) - flt(frm.doc.debt_adjustment_amount);
		const rows = (frm.doc.payments || []).slice().sort((a, b) => String(a.receipt_date).localeCompare(String(b.receipt_date)));
		const body = rows.map((p, i) => {
			bal -= flt(p.amount);
			return `<tr><td>${i + 1}</td><td>${e(p.receipt_no || "")}</td><td>${frappe.datetime.str_to_user(p.receipt_date)}</td><td>${frappe.datetime.str_to_user((p.creation || "").slice(0, 10))}</td><td>${format_currency(flt(p.amount), cur, 3)}</td><td>${format_currency(bal, cur, 3)}</td><td>${e(p.remarks || "")}</td></tr>`;
		}).join("");
		$(frm.fields_dict.payment_history_html.wrapper).html(
			`<table class="dc-table light"><thead><tr><th>#</th><th>${__("Receipt No.")}</th><th>${__("Receipt Date")}</th><th>${__("Creation Date")}</th><th>${__("Amount")}</th><th>${__("Balance")}</th><th>${__("Remarks")}</th></tr></thead><tbody>${body}</tbody></table>`
		);
	},
});
