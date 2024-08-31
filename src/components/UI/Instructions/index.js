import React from "react";

export default function Instructions() {

  return (
    <>
      <div className='instructions'>
        <div className='instructions__inner'>
          <div className='click-drag'>
            <div className='click-img'>
              <img src='assets/images/hand.png' alt='' />
            </div>
            <p>{"Click and drag on the screen to look around."}</p>
          </div>
          <div className='tap'>
            <div className='tap-img'>
              <img src='assets/images/tap.png' alt='' />
            </div>
            <p>{"Click on the floor to move."}</p>
          </div>
        </div>
      </div>
    </>
  );
}
