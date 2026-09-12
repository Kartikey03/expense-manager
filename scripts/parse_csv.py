#!/usr/bin/env python3
"""
Parse the "Yearly Budget Tracker" CSV into transaction rows for Supabase.

Usage:
  SEED_USER_ID=<your-auth-user-uuid> python3 scripts/parse_csv.py "Yearly Budget Tracker(2026)3.csv" > txns.json

Then bulk-insert txns.json with the Supabase service_role key:
  curl -X POST "$SUPABASE_URL/rest/v1/transactions" \
    -H "apikey: $SERVICE_ROLE" -H "Authorization: Bearer $SERVICE_ROLE" \
    -H "Content-Type: application/json" --data-binary @txns.json

The sheet has three side-by-side groups (Expenses | Income | Investments),
each as Date / Amount / Description columns. Investment withdrawals are negative.
"""
import csv, re, json, sys, os

USER_ID = os.environ.get("SEED_USER_ID", "REPLACE_WITH_USER_ID")
DATE_RE = re.compile(r"^\s*(\d{1,2})/(\d{1,2})/(\d{4})\s*$")


def parse_amount(s):
    if s is None:
        return None
    s = s.replace("₹", "").replace(",", "").replace("\xa0", " ").strip()
    if s in ("", "-"):
        return None
    try:
        return round(float(s), 2)
    except ValueError:
        return None


def norm_date(m, d, y):
    return f"{int(y):04d}-{int(m):02d}-{int(d):02d}"


def categorize_expense(desc):
    d = desc.lower()
    if "mummy" in d or "mom" in d:
        return "Family"
    if any(k in d for k in ["sub", "premium", "claude", "youtube", "tanmay", "samay raina"]):
        return "Subscriptions"
    if any(k in d for k in ["zerodha", "ddpi", "ecs return", "smallcase exit", "quarterly", "charges"]):
        return "Investment Charges"
    if any(k in d for k in ["gym", "medicine", "medicines", "watch repair", "apple care"]):
        return "Health & Fitness"
    if any(k in d for k in ["movie", "popcorn", "spiderman", "guitar", "badminton", "shuttle", "beer", "goa", "trip", "hangout"]):
        return "Entertainment"
    if any(k in d for k in ["bdday", "birthday", "gift", "bakingo"]):
        return "Gifts"
    if any(k in d for k in ["iphone", "cable", "charger", "bottle", "scooty"]):
        return "Shopping & Gadgets"
    if any(k in d for k in ["food", "gol gappe", "gappa", "coffee", "chaap", "doodh", "kachori", "lassi",
                             "egg", "coconut", "choco", "waffle", "burger", "dosa", "cheesecake", "rasgull",
                             "rabdi", "falooda", "canteen", "drinks", "households", "dhaba", "lunch",
                             "zomato", "swiggy", "kolaahal", "chocolate", "laddu", "juice", "kulladh",
                             "lava cake", "cake", "besan", "sponge", "pineapple", "kanpur food", "madhur"]):
        return "Food & Snacks"
    return "Miscellaneous"


def categorize_income(desc):
    d = desc.lower()
    if "infatix" in d:
        return "Salary — Infatix"
    if "digital heroes" in d or "(dh)" in d or d.strip() == "dh":
        return "Salary — Digital Heroes"
    if "niot" in d:
        return "Salary — NIOT"
    if "freelance" in d or "newspaper" in d or "sumi" in d:
        return "Freelance"
    return "Other Income"


def categorize_investment(desc):
    d = desc.lower()
    if "withdraw" in d or "withdrew" in d:
        return "Withdrawal"
    if "liquid" in d:
        return "Liquid Funds"
    if "etf" in d or "gold" in d:
        return "Gold / ETF"
    if "bitcoin" in d or "crypto" in d:
        return "Crypto"
    if "smallcase" in d or "precious meals" in d or "tracker" in d:
        return "Smallcase"
    if any(k in d for k in ["mf", "mutual", "nifty", "mid cap", "navi"]):
        return "Mutual Funds"
    return "Other"


def extract(rows, dcol, acol, ccol, ttype, catfn):
    out = []
    for r in rows:
        if len(r) <= max(dcol, acol, ccol):
            continue
        dm = DATE_RE.match(r[dcol] or "")
        if not dm:
            continue
        amt = parse_amount(r[acol])
        if amt is None:
            continue
        desc = (r[ccol] or "").strip()
        cat = catfn(desc)
        out.append({
            "user_id": USER_ID,
            "type": ttype,
            "txn_date": norm_date(dm.group(1), dm.group(2), dm.group(3)),
            "amount": amt,
            "description": desc,
            "category": cat,
            "source": None if ttype == "expense" else cat,
        })
    return out


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "Yearly Budget Tracker(2026)3.csv"
    with open(path, newline="", encoding="utf-8") as f:
        rows = list(csv.reader(f))
    txns = (
        extract(rows, 0, 1, 2, "expense", categorize_expense)
        + extract(rows, 4, 5, 6, "income", categorize_income)
        + extract(rows, 8, 9, 10, "investment", categorize_investment)
    )
    json.dump(txns, sys.stdout, indent=2)


if __name__ == "__main__":
    main()
