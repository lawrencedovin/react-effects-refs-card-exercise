import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import "./Deck.css";

const API_BASE_URL = "http://deckofcardsapi.com/api/deck";

/* Deck: uses deck API, allows drawing card at a time. */

function Deck() {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [autoDraw, setAutoDraw] = useState(false);
  const timerRef = useRef(null);

  /* At mount: load deck from API into state. */
  useEffect(() => {
    async function getData() {
      let d = await axios.get(`${API_BASE_URL}/new/shuffle/`);
      // d.data Gets a Card Deck Object and sets it to Deck
      // d.data =  {
      //             deck_id: "9j32kn8tud7t"
      //             remaining: 52
      //             shuffled: true
      //             success: true
      //           }
      setDeck(d.data);
    }
    getData();
  }, [setDeck]);

  /* Draw one card every second if autoDraw is true */
  useEffect(() => {
    /* Draw a card via API, add card to state "drawn" list */
    async function getCard() {
      // destructures deck_id from Deck Object
      let { deck_id } = deck;

      try {
        let drawRes = await axios.get(`${API_BASE_URL}/${deck_id}/draw/`);

        if (drawRes.data.remaining === 0) {
          setAutoDraw(false);
          throw new Error("no cards remaining!");
        }

        const card = drawRes.data.cards[0];

        // Already drawn cards stays and appends 
        // new card that is drawn to drawn state
        setDrawn(d => [
          ...d,
          {
            id: card.code,
            name: card.suit + " " + card.value,
            image: card.image
          }
        ]);
      } catch (err) {
        alert(err);
      }
    }

    // if autoDraw is true and timerRef is new and not the previous value
    if (autoDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await getCard();
      }, 1000);
    }

    // cleans up useEffect and removes old timerRef
    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoDraw, setAutoDraw, deck]);

  // if autoDraw is false turns to true vice versa
  // for onClick
  const toggleAutoDraw = () => {
    setAutoDraw(auto => !auto);
  };

  const cards = drawn.map(c => (
    <Card key={c.id} name={c.name} image={c.image} />
  ));

  return (
    <div className="Deck">
      {deck ? (
        <button className="Deck-gimme" onClick={toggleAutoDraw}>
          {autoDraw ? "STOP" : "KEEP"} DRAWING FOR ME!
        </button>
      ) : null}
      <div className="Deck-cardarea">{cards}</div>
    </div>
  );
}

export default Deck;
