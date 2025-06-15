import Listing from '../models/Listing.js';

export const searchLocation = async (req, res) => {
  try {
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ error: "Location is required" });
    }

    const listingLocations = await Listing.findAll({ attributes: ["city", "country"] });

    // Extract unique city and country names, removing null/undefined values
    const cityNames = [...new Set(listingLocations.map((listing) => listing.city).filter(Boolean))];
    const countryNames = [...new Set(listingLocations.map((listing) => listing.country).filter(Boolean))];

    const searchQuery = city.toLowerCase();

    // Match cities and countries even if a single character appears in the name
    const matchedCities = cityNames.filter((city) =>
      [...searchQuery].some((char) => city.toLowerCase().includes(char))
    );
    const matchedCountries = countryNames.filter((country) =>
      [...searchQuery].some((char) => country.toLowerCase().includes(char))
    );

    // Combine results and sort by relevance
    const cities = [...matchedCities, ...matchedCountries].sort((a, b) => {
      let aStarts = a.toLowerCase().startsWith(searchQuery);
      let bStarts = b.toLowerCase().startsWith(searchQuery);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    });

    if (cities.length === 0) {
      return res.status(201).json({ message: "No results found" });
    }

    return res.json({ cities });
  } catch (error) {
    console.error("Error searching locations:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
