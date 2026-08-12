const Event = require("../models/Event");

const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      location,
      bannerImage,
      ticketTypes,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !eventDate ||
      !startTime ||
      !endTime ||
      !location ||
      !ticketTypes
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const formattedTicketTypes = ticketTypes.map((ticket) => ({
      name: ticket.name,
      price: ticket.price,
      quantity: ticket.quantity,
      availableQuantity: ticket.quantity,
    }));

    const event = await Event.create({
      title,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      location,
      bannerImage,
      ticketTypes: formattedTicketTypes,
      organizer: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      date,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {
      status: "approved",
    };

    // Search by title or description
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Category filter
    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    // Location filter
    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    // Date filter
    if (date) {
      const startOfDay = new Date(`${date}T00:00:00`);
      const endOfDay = new Date(`${date}T23:59:59`);

      filter.eventDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    // Price filter
    if (minPrice || maxPrice) {
      const priceFilter = {};

      if (minPrice) {
        priceFilter.$gte = Number(minPrice);
      }

      if (maxPrice) {
        priceFilter.$lte = Number(maxPrice);
      }

      filter["ticketTypes.price"] = priceFilter;
    }

    const events = await Event.find(filter)
      .populate("organizer", "name email")
      .sort({ eventDate: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      filters: {
        search: search || null,
        category: category || null,
        location: location || null,
        date: date || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
      },
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "name email");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      organizer: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Organizer can only update their own event
    if (
      req.user.role !== "admin" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own events",
      });
    }

    const {
      title,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      location,
      bannerImage,
      ticketTypes,
    } = req.body;

    if (ticketTypes) {
      const formattedTicketTypes = ticketTypes.map((ticket) => ({
        name: ticket.name,
        price: ticket.price,
        quantity: ticket.quantity,
        availableQuantity: ticket.availableQuantity ?? ticket.quantity,
      }));

      event.ticketTypes = formattedTicketTypes;
    }

    event.title = title ?? event.title;
    event.description = description ?? event.description;
    event.category = category ?? event.category;
    event.eventDate = eventDate ?? event.eventDate;
    event.startTime = startTime ?? event.startTime;
    event.endTime = endTime ?? event.endTime;
    event.location = location ?? event.location;
    event.bannerImage = bannerImage ?? event.bannerImage;

    const updatedEvent = await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Organizer can only delete their own event
    if (
      req.user.role !== "admin" &&
      event.organizer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own events",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
};