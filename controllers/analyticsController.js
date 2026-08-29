const Event = require("../models/Event");
const Booking = require("../models/Booking");

const getOrganizerAnalytics = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id,
    }).select(
      "title eventDate ticketTypes status"
    );

    const eventIds = events.map(
      (event) => event._id
    );

    const bookings = await Booking.find({
      event: {
        $in: eventIds,
      },
    });

    const eventAnalytics = events.map(
      (event) => {
        const eventBookings =
          bookings.filter(
            (booking) =>
              booking.event.toString() ===
              event._id.toString()
          );

        const validBookings =
          eventBookings.filter(
            (booking) =>
              booking.bookingStatus ===
                "confirmed" &&
              booking.paymentStatus ===
                "paid"
          );

        const ticketsSold =
          validBookings.reduce(
            (total, booking) =>
              total + booking.quantity,
            0
          );

        const revenue =
          validBookings.reduce(
            (total, booking) =>
              total +
              Number(
                booking.totalAmount || 0
              ),
            0
          );

        const checkedInTickets =
          validBookings.reduce(
            (total, booking) =>
              booking.checkedIn
                ? total +
                  booking.quantity
                : total,
            0
          );

        const attendanceRate =
          ticketsSold > 0
            ? Math.round(
                (checkedInTickets /
                  ticketsSold) *
                  100
              )
            : 0;

        return {
          eventId: event._id,
          title: event.title,
          eventDate: event.eventDate,
          status: event.status,

          bookings:
            validBookings.length,

          ticketsSold,

          revenue,

          checkedInTickets,

          attendanceRate,
        };
      }
    );

    const totals =
      eventAnalytics.reduce(
        (result, event) => {
          result.totalTicketsSold +=
            event.ticketsSold;

          result.totalRevenue +=
            event.revenue;

          result.totalCheckedIn +=
            event.checkedInTickets;

          result.totalBookings +=
            event.bookings;

          return result;
        },
        {
          totalTicketsSold: 0,
          totalRevenue: 0,
          totalCheckedIn: 0,
          totalBookings: 0,
        }
      );

    const overallAttendanceRate =
      totals.totalTicketsSold > 0
        ? Math.round(
            (totals.totalCheckedIn /
              totals.totalTicketsSold) *
              100
          )
        : 0;

    return res.status(200).json({
      success: true,

      summary: {
        totalEvents: events.length,
        totalBookings:
          totals.totalBookings,
        ticketsSold:
          totals.totalTicketsSold,
        revenue:
          totals.totalRevenue,
        checkedIn:
          totals.totalCheckedIn,
        attendanceRate:
          overallAttendanceRate,
      },

      events: eventAnalytics,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getOrganizerAnalytics,
};