function isAppleTouchDevice() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
}

function isCalendarFile(file: File) {
  return file.type.toLowerCase().startsWith("text/calendar") || /\.ics$/i.test(file.name)
}

function openCalendarFile(file: File) {
  const calendarBlob = new Blob([file], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(calendarBlob)

  // On iOS/iPadOS, navigating directly to a text/calendar resource lets Safari
  // hand the .ics payload to the system calendar importer. Using navigator.share
  // only opens the generic Share Sheet, where Calendar is not a guaranteed target.
  window.location.assign(url)
}

export function installAppleCalendarShareFix() {
  if (!isAppleTouchDevice() || typeof navigator.share !== "function") return

  const nativeShare = navigator.share.bind(navigator)

  try {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data?: ShareData) => {
        const calendarFile = data?.files?.find(isCalendarFile)

        if (calendarFile) {
          openCalendarFile(calendarFile)
          return
        }

        await nativeShare(data)
      },
    })
  } catch {
    // If Safari does not allow overriding navigator.share, leave native sharing intact.
  }
}

installAppleCalendarShareFix()
