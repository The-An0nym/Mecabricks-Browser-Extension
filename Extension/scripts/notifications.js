// The prupose of this file:
// Save the last 10 - 30 Notifications and check for differences whenever new notifications pop up
// If those changes only includes hidden users and thread, hide the notification badge
// Maybe -> Only fetch if there is a new notification (-> Notification number increased. Save this somewhere)
// Otherwise fetch, store differences, etc.
// ALSO: Don't forget to link it to the manifest.json

fetch("https://www.mecabricks.com/api/notifications/get", {
  headers: {
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  },
  body: "datetime=&lang=en",
  method: "POST",
})
  .then((x) => x.json())
  .then((x) => console.log(x));
