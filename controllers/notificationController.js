const Event = require("../models/Event");
const Booking = require("../models/Booking");
const sendEmail = require("../utils/sendEmail");

const notifyScheduleChange = async (
  req,
  res
) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(
      eventId
    );

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Organizer can notify only for own event.
    // Admin can notify for any event.
    if (
      req.user.role !== "admin" &&
      event.organizer.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to notify attendees for this event",
      });
    }

    const bookings = await Booking.find({
      event: eventId,
      bookingStatus: "confirmed",
      paymentStatus: "paid",
    }).populate(
      "user",
      "name email"
    );

    if (bookings.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message:
          "No registered attendees to notify",
      });
    }

    const scheduleHtml =
      event.schedule?.length > 0
        ? event.schedule
            .map(
              (session) => `
                <div style="margin-bottom:18px;">
                  <strong>${session.sessionTitle}</strong><br/>
                  Date:
                  ${new Date(
                    session.date
                  ).toLocaleDateString()}<br/>
                  Time:
                  ${session.startTime} -
                  ${session.endTime}<br/>
                  ${
                    session.speaker
                      ? `Speaker: ${session.speaker}<br/>`
                      : ""
                  }
                  ${
                    session.description
                      ? `<div>${session.description}</div>`
                      : ""
                  }
                </div>
              `
            )
            .join("")
        : "<p>Schedule details are currently unavailable.</p>";

    const results =
      await Promise.allSettled(
        bookings.map((booking) =>
          sendEmail({
            to: booking.user.email,

            subject: `Schedule updated: ${event.title}`,

            html: `
              <h2>Event Schedule Updated</h2>

              <p>
                Hi ${booking.user.name},
              </p>

              <p>
                The schedule for
                <strong>${event.title}</strong>
                has been updated.
              </p>

              <h3>Updated Schedule</h3>

              ${scheduleHtml}

              <p>
                Event Location:
                ${event.location}
              </p>
            `,
          })
        )
      );

    const successful =
      results.filter(
        (result) =>
          result.status === "fulfilled"
      ).length;

    const failed =
      results.length - successful;

    return res.status(200).json({
      success: true,
      message:
        "Schedule notification process completed",
      registeredAttendees:
        bookings.length,
      emailsSent: successful,
      emailsFailed: failed,
    });
  } catch (error) {
    console.error(
      "Schedule notification error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  notifyScheduleChange,
};