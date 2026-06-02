// Booking.com does not provide a public reply API for non-enterprise partners.
// Reviews can be imported via CSV export from the Booking.com Extranet.
export const BOOKING_EXTRANET_URL = "https://admin.booking.com/hotel/hoteladmin/extranet_ng/manage/reviews.html";

export function getBookingReplyInstructions(): string {
  return `Um auf Booking.com-Bewertungen zu antworten, besuchen Sie das Booking.com Extranet unter ${BOOKING_EXTRANET_URL}. Exportieren Sie Ihre Bewertungen als CSV und importieren Sie diese in ReviewHub.`;
}
