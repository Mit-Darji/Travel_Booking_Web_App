import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const cards = [
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Acko_Logo.png",
    text: "Insurance made easy – Acko",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/4/42/Across_Assist_Logo.png",
    text: "Embark on your travels with world-class assistance, anytime-anywhere!",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Tata_AIG_logo.png",
    text: "You can enroll yourself in the Group Travel Insurance Policy.",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/9/9e/Acko_Logo.png",
    text: "More coverage, less hassle – Acko Insurance",
  },
  {
    img: "https://upload.wikimedia.org/wikipedia/commons/4/42/Across_Assist_Logo.png",
    text: "Reliable travel assistance, anytime-anywhere!",
  },
];

export default function InsuranceCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={prevSlide}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>

        <div className="w-[1170px] overflow-hidden relative p-2">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-4"
            style={{
              transform: `translateX(-${(index * 100) / cards.length}%)`,
            }}
          >
            {cards.map((card, i) => (
              <div
                key={i}
                className="w-[401px] flex-shrink-0 flex items-center bg-white p-4 rounded-xl shadow-md"
              >
                <div className="min-w-[56px] w-14 h-14 mr-3">
                  <img
                    src={card.img}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-gray-800 font-medium">{card.text}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={nextSlide}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-200 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );
}