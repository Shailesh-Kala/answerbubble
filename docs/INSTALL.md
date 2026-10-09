# How to add the help bubble to your website

This guide is for business owners. You don't need to know any code. It takes about 5 minutes.

## Step 1: Get your code

1. Open the setup page (`configurator/index.html`, or the online version if you have the link).
2. Pick your type of business. Common questions are filled in for you.
3. Type your **WhatsApp number with the country code**, e.g. `91 00000 00000` for India. Don't start with 0.
4. Change the answers: replace everything in [square brackets] with your own details.
5. Check the preview, then click **Copy code**.

You'll see two choices:

- **All-in-one** (recommended): everything is in one piece of code. Nothing to upload.
- **Short code**: a smaller piece of code that loads the widget from a link. Use this if your website builder limits how much code you can paste.

## Step 2: Paste it into your website

Pick your website platform below. Always paste the code so it loads on **every page**, at the **end of the page** (the "footer" or "end of body" box).

### WordPress

1. In your WordPress dashboard, go to **Plugins > Add New Plugin**. Search for **WPCode**, click **Install Now**, then **Activate**. WPCode is free.
2. Go to **Code Snippets > Header & Footer**.
3. Paste your code into the **Footer** box.
4. Click **Save Changes**.
5. If you use a cache plugin, clear its cache (see "Clearing the cache" below). Then open your website to check.

**Plan:** free on self-hosted WordPress. On WordPress.com, "installing plugins is available on all WordPress.com paid plans", so the free WordPress.com plan can't do this.
Official help: [WPCode plugin](https://wordpress.org/plugins/insert-headers-and-footers/) · [WPCode Header & Footer](https://wpcode.com/docs/using-the-global-header-footer-settings/) · [WordPress.com plugins](https://wordpress.com/support/plugins/)

### Framer

1. Open your project and go to **Project Settings** (called **Site Settings** in older versions).
2. Open the **Custom Code** tab and click **Add Script** (or **+**).
3. Name it "Help widget" and paste your code. Choose the **end of `<body>`** position. Leave the page list empty so it appears on every page.
4. Publish your site. Custom code doesn't run in the editor preview, only on your published site.

**Plan:** Framer's help pages don't list a plan for custom code. Framer says its Free plan "is ideal for non-commercial use" and you need a paid plan to use your own domain, so a business website is usually on a paid plan anyway.
Official help: [How to add custom code](https://www.framer.com/help/articles/how-to-add-custom-code/) · [Framer pricing](https://www.framer.com/pricing)

### Webflow

1. Open **Site settings**, then the **Custom code** tab.
2. Paste your code into the **Footer code** box. It holds up to 50,000 characters, which is plenty.
3. Click **Save changes**.
4. **Publish** your site. Custom code only goes live after you publish.

**Plan:** needs a paid plan. Webflow allows custom code if you have an active **Site plan**, or a **Core, Growth, Agency or Freelancer** Workspace. The free Starter plan can't add it.
Official help: [Custom code in head and body tags](https://help.webflow.com/hc/en-us/articles/33961357265299)

### Shopify

1. In your Shopify admin, go to **Online Store > Themes**.
2. Next to your current theme, click the **…** button and choose **Duplicate**. This keeps a backup copy.
3. Click **…** on your current theme again and choose **Edit code**.
4. Under **Layout**, open **theme.liquid**. Paste your code just above `</body>` near the bottom, then click **Save**.
5. If you change themes later, paste the code into the new theme too.

**Plan:** works on any Shopify plan with an online store. If you're trying a paid theme, you can only edit its code after buying it.
Official help: [Edit theme code](https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend/edit-theme-code)

### Wix

1. Open your site's dashboard and go to **Settings**.
2. Under **Development & integrations**, click **Custom Code**, then **+ Add Custom Code**.
3. Paste your code and name it "Help widget".
4. Under **Add Code to Pages**, choose **All pages**. Under **Place Code in**, choose **Body - end**.
5. Click **Apply**, then open your live site to check.

**Plan:** needs a paid plan. Wix only allows custom code on a published site with a connected domain, and connecting a domain needs a Wix Premium plan.
Official help: [Embedding custom code on your site](https://support.wix.com/en/article/embedding-custom-code-on-your-site)

### Squarespace

1. Open **Pages**, scroll down to **Website Tools**, and click **Code Injection**.
2. Paste your code into the **Footer** box.
3. Click **Save**.
4. Check your live site in a private (incognito) window. The editor may not run scripts.

**Plan:** code injection is included in the **Core, Plus and Advanced** plans and some older plans. It isn't in the cheapest plan. It also doesn't run on Squarespace checkout pages.
Official help: [Using code injection](https://support.squarespace.com/hc/en-us/articles/205815908-Using-code-injection)

### Plain HTML website

1. Open your page's HTML file in a text editor.
2. Paste your code just above `</body>`.
3. Save and upload the file to your web host.
4. Do this on every page, or once in a shared footer file if your site has one.

**Plan:** free. Works with any web host.

## Use your own "Contact us" button

Any button or link with `data-help-open` opens the chat window. For example:

```html
<a href="#" data-help-open>Ask us a question</a>
```

## Troubleshooting

### The bubble doesn't show

1. **Publish your site.** Framer, Webflow, Wix and Squarespace only run the code on the live site, not in the editor.
2. **Clear your cache.** See "Clearing the cache" below, then check in a private (incognito) window.
3. **Check your WhatsApp number.** If it's missing or wrong, the bubble hides itself. Open the setup page again and look for a red message under the number.
4. **Look for a message from the widget.** On a computer, open your site, right-click, choose **Inspect**, then the **Console** tab. Messages starting with "Help widget:" tell you exactly what to fix.
5. **Check you pasted the whole code**, from `<!-- AnswerBubble` to the last `</script>`. A missing piece stops it working.
6. **Check the page isn't hidden.** (Pro) If you set "Hide on these pages", the bubble doesn't show on pages whose address starts with those words.

### WhatsApp opens the wrong number

1. Open the setup page and check the number in step 2. It must start with your **country code** (91 for India), with no 0 in front, e.g. `910000000000`.
2. (Pro) If you added more than one number, check each number under **Pro options**.
3. Copy the new code and replace the **whole** old code on your website. Don't keep two copies: if the code is pasted twice, only the first one is used.
4. Clear your cache and test again in a private window.

### It shows on a page where I don't want it

- **Pro:** in the setup page, open **Pro options** and fill in **Hide on these pages**, e.g. `/checkout, /cart`. The bubble won't show on any page whose address starts with these.
- **Free:** add the code only to the pages you want instead of to the whole site. Wix (choose specific pages instead of **All pages**) and Framer (pick pages in the page list) let you do this in the same place where you pasted the code.

### Clearing the cache on WordPress cache plugins

Cache plugins keep an old copy of your pages, so your visitors may not see the bubble until you clear it.

- **WP Rocket:** at the top of your dashboard, point at **WP Rocket** and click **Clear and preload cache** (or **Clear cache**). Or go to **Settings > WP Rocket > Dashboard**. [WP Rocket help](https://docs.wp-rocket.me/article/53-clear-cache)
- **LiteSpeed Cache:** go to **LiteSpeed Cache > Toolbox > Purge** and click **Purge All**. [LiteSpeed help](https://docs.litespeedtech.com/lscache/lscwp/toolbox/)
- **Other cache plugins** (W3 Total Cache, WP Super Cache and others): look at the top bar of your dashboard or the plugin's settings page for a button called **Purge All**, **Clear cache** or **Delete cache**.
- **Your web host or Cloudflare** may also keep a cache. Look for "Purge cache" or "Clear cache" in your hosting panel.

**If the bubble only appears after you scroll or tap:** your cache plugin is delaying scripts until the visitor interacts. Find its "Delay JavaScript" setting and add `HelpWidget` and `help-widget` to its list of exclusions, then clear the cache again.

### Still stuck?

Shailesh Kala can install it for you. Find the "I'll install it for you" service on Contra.
