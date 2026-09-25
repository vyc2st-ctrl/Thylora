"""Chromium test of the library download control against a mocked backend.

Run: python3 test_download_control.py   (uses the pre-installed Chromium)
No network: the supabase-js import and the protected-download endpoint are intercepted.
"""
import json, os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
PAGE = open(os.path.join(HERE, 'index.html')).read()

ITEMS = [
  {"external_product_id": "gid://shopify/Product/7957652275277", "title": "Twelve Miles for Flour", "edf_code": "EDF-TWELVE-MILES-FOR-FLOUR-001",
   "state": "ACTIVE", "openable": True, "entitlement_id": "ent-tm", "download_available": True,
   "download": {"filename": "Uncle-Seezin-Twelve-Miles-for-Flour.pdf"}},
  {"external_product_id": "gid://shopify/Product/7957199749197", "title": "THYLORA Gap Hunt", "edf_code": None,
   "state": "ACTIVE", "openable": False, "not_openable_reason": "No EDF package exists for this product yet",
   "entitlement_id": "ent-gap", "download_available": True, "download": {"filename": "THYLORA-Gap-Hunt-21.pdf"}},
  {"external_product_id": "gid://shopify/Product/0", "title": "No file yet", "edf_code": None, "state": "ACTIVE",
   "openable": False, "not_openable_reason": "No EDF package exists for this product yet",
   "entitlement_id": "ent-none", "download_available": False, "not_downloadable_reason": "No ACTIVE delivery asset is connected for this product"},
]

STUB = """
export function createClient(){
  const session = { access_token: 'TEST-TOKEN', user: { id: 'u1', email: 'buyer@example.com' } };
  return {
    auth: {
      onAuthStateChange(cb){ setTimeout(()=>cb('SIGNED_IN', session), 0); return { data: { subscription: { unsubscribe(){} } } }; },
      getSession: async () => ({ data: { session } }),
      signOut: async () => ({}), signInWithOtp: async () => ({}), signInWithPassword: async () => ({})
    },
    rpc: async (name) => name === 'thylora_customer_library_v1'
      ? { data: { items: ITEMS, claim_check: { claimed: 0 } } }
      : { data: { delivered: false } }
  };
}
const ITEMS = __ITEMS__;
""".replace('__ITEMS__', json.dumps(ITEMS))

results = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=os.environ.get('CHROMIUM', '/opt/pw-browsers/chromium') if os.path.exists('/opt/pw-browsers/chromium') else None)
    ctx = b.new_context(accept_downloads=True)
    page = ctx.new_page()
    calls = []
    page.route('https://esm.sh/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=STUB))
    def dl(route):
        calls.append({'url': route.request.url, 'auth': route.request.headers.get('authorization')})
        route.fulfill(status=200, content_type='application/pdf', body=b'%PDF-1.4 test')
    page.route('https://jvsdxhrfhtlgaknhjxlz.supabase.co/functions/v1/thylora-protected-download**', dl)
    page.route('https://test.local/', lambda r: r.fulfill(status=200, content_type='text/html', body=PAGE))
    page.goto('https://test.local/')
    page.wait_for_selector('[data-download]')
    items = page.locator('.item')
    results['item_count'] = items.count()
    results['twelve_miles_buttons'] = items.nth(0).locator('button').all_inner_texts()
    results['gap_hunt_buttons'] = items.nth(1).locator('button').all_inner_texts()
    results['no_file_text'] = items.nth(2).inner_text()
    with page.expect_download() as d:
        items.nth(1).locator('[data-download]').click()
    results['download_filename'] = d.value.suggested_filename
    results['endpoint_calls'] = calls
    results['message'] = page.locator('#claimMsg').inner_text()
    b.close()

print(json.dumps(results, indent=1))
ok = (results['twelve_miles_buttons'] == ['Read it', 'Download PDF']
      and results['gap_hunt_buttons'] == ['Download PDF']
      and 'No ACTIVE delivery asset' in results['no_file_text']
      and results['download_filename'] == 'THYLORA-Gap-Hunt-21.pdf'
      and len(calls) == 1 and calls[0]['auth'] == 'Bearer TEST-TOKEN'
      and 'entitlement_id=ent-gap' in calls[0]['url'])
print('PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
