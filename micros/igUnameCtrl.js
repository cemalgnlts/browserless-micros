await page.goto("https://www.instagram.com/accounts/emailsignup/", {
  waitUntil: "networkidle2",
});

const usernames = context.username.split(",");
const free = [];

for (const username of usernames) {
  await page.type('[name="username"]', username);
  await page.keyboard.press("Enter");

  const res = await page.waitForResponse("https://www.instagram.com/api/v1/web/accounts/web_create_ajax/attempt/");
  const data = await res.json();

  if(!data.errors.username) free.push(username);
}

return free;
