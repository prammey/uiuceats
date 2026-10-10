# Google Forms for UIUC Eats

Two forms power the optional features on uiuceats.vercel.app. Open a blank Google Form,
paste the matching block into the Claude browser extension, and repeat for the second form.
Question titles must match exactly because the collector reads spreadsheet columns by name.

Tip: create the forms while signed in to your illinois.edu Google account. The Settings tab
then offers "Restrict to users in University of Illinois", which blocks outside spam.

When both forms exist, send back the four links (PROMOTED_CSV_URL, ADVERTISE_FORM_URL,
REPORTS_CSV_URL, REPORT_FORM_URL). The CSV links go in GitHub repository variables, the form
links go in Vercel environment variables, then redeploy.

---

## Form 1: Advertise your event

```
You are editing a blank Google Form. Do the following in order.

1. Click "Untitled form" and set the title to: UIUC Eats: Advertise your free-food event
2. Set the form description to:
   Get a highlighted spot on uiuceats.vercel.app. Rules: the food must be free and the event must be walk-in (no RSVP, tickets, or registration). Give a link to the official event page or post so students can verify it. Submissions that can't be verified are not shown.

3. Add these questions, in this order. For each: click the "+" (Add question) button, choose the type, type the exact title, and set Required as noted.

   a. Title: Event name            Type: Short answer    Required: yes
   b. Title: Host organization     Type: Short answer    Required: yes
   c. Title: Date                  Type: Date            Required: yes
   d. Title: Start time            Type: Time            Required: yes
   e. Title: End time              Type: Time            Required: yes
   f. Title: Location              Type: Short answer    Required: yes
      Description: Building and room, or street address.
   g. Title: What food             Type: Short answer    Required: yes
      Description: For example "Pizza from Papa Del's" or "Samosas and chai".
   h. Title: Dietary notes         Type: Short answer    Required: no
      Description: Mention vegetarian, vegan, halal, kosher, or gluten-free only if offered.
   i. Title: Proof link            Type: Short answer    Required: yes
      Description: URL of the official event page, calendar entry, or social post.
      Turn on Response validation: Text → URL (click the three-dot menu on the question → "Response validation" → choose "Text" and "URL").

4. Click the "Settings" tab at the top. Under "Responses", turn on "Collect email addresses" and choose "Verified".

5. Click the "Responses" tab at the top. Click "Link to Sheets", choose "Create a new spreadsheet", keep the default name, click "Create". A Google Sheet opens in a new tab.

6. In that Google Sheet: click File → Share → Publish to web. In the dialog, on the "Link" tab, set the first dropdown to "Form Responses 1" and the second dropdown to "Comma-separated values (.csv)". Click "Publish", confirm "OK". Copy the link shown and report it back as: PROMOTED_CSV_URL = <link>

7. Go back to the form tab. Click "Send" (top right), click the link icon, click "Copy". Report it back as: ADVERTISE_FORM_URL = <link>
```

---

## Form 2: Report a problem

```
You are editing a blank Google Form. Do the following in order.

1. Click "Untitled form" and set the title to: UIUC Eats: Report a problem
2. Set the form description to:
   Went somewhere from uiuceats.vercel.app and there was no food, or the listing was wrong? Tell us. Listings with two or more reports are hidden automatically.

3. Add these questions in this order:

   a. Title: Event ID        Type: Short answer    Required: yes
      Description: This is filled in automatically when you click Report on the website.
   b. Title: What's wrong    Type: Paragraph       Required: yes
      Description: For example "No food", "Event was cancelled", "Required registration", "Wrong room".

4. Click the "Responses" tab. Click "Link to Sheets", choose "Create a new spreadsheet", click "Create". A Google Sheet opens.

5. In that Google Sheet: File → Share → Publish to web. On the "Link" tab set the first dropdown to "Form Responses 1" and the second to "Comma-separated values (.csv)". Click "Publish", confirm. Copy the link and report it back as: REPORTS_CSV_URL = <link>

6. Go back to the form tab. Click the three-dot menu (top right, next to Send) → "Get pre-filled link". In the "Event ID" field type exactly: EVENT_ID
   Leave "What's wrong" empty. Click "Get link" at the bottom, then "Copy link". Report it back as: REPORT_FORM_URL = <link>
```

---

## Where the links go

| Link | Where to set it | Name |
|---|---|---|
| Promoted sheet CSV | GitHub → repo → Settings → Secrets and variables → Actions → Variables | `PROMOTED_CSV_URL` |
| Reports sheet CSV | same place | `REPORTS_CSV_URL` |
| Advertise form link | Vercel → uiucfood → Settings → Environment Variables | `NEXT_PUBLIC_ADVERTISE_FORM_URL` |
| Report pre-filled link (keep `EVENT_ID` in it) | same place | `NEXT_PUBLIC_REPORT_FORM_URL` |
