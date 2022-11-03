import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Card from "./Card";
import "./DeckOfCards.css";

let BASE_URL = "https://deckofcardsapi.com/api/deck";

const Deck = () => {
  const [deck, setDeck] = useState(null);
  const [draw, setDraw] = useState([]);
  const [autoDraw, setAutoDraw] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    async function genNewDeck() {
      let res = await axios.get(`${BASE_URL}/new/`);
      setDeck(res.data);
    }
    genNewDeck();
  }, [setDeck]);

  useEffect(() => {
    async function drawCard() {
      let { deck_id } = deck;

      try {
        let cardRes = await axios.get(`${BASE_URL}/${deck_id}/draw/?count=1`);
        if (cardRes.data.remaining === 0) {
          throw new Error("No cards left in the deck.");
        }

        let card = cardRes.data.cards[0];

        setDraw((res) => [
          ...res,
          {
            id: card.code,
            name: card.suit + " " + card.value,
            image: card.image,
          },
        ]);
      } catch (e) {
        alert(e);
      }
    }
    if (autoDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await drawCard();
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoDraw, setAutoDraw, deck]);

  const toggleAutoDraw = () => {
    setAutoDraw((auto) => !auto);
  };

  const cards = draw.map((card) => {
    <Card key={card.id} name={card.name} image={card.image} />;
  });

  return (
    <div className="Deck">
      {deck ? (
        <button className="Deck-gimme" onClick={toggleAutoDraw}>
          {autoDraw ? "Stop" : "Keep"} drawing
        </button>
      ) : null}
      <div className="Deck-cardarea">{cards}</div>
    </div>
  );
};

export default Deck;
