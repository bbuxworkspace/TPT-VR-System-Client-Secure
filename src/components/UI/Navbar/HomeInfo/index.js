import React from "react";
import { Row, Col, InfoItem } from "./style";

export default function HomeInfo() {
  return (
    <Row>
      <Col>
        <InfoItem>
          <div className='label'>{"Area"}</div>
          <div className='details'>80 m2</div>
        </InfoItem>
      </Col>
      <Col>
        <InfoItem>
          <div className='label'>{"Rooms"}</div>
          <div className='details'>4</div>
        </InfoItem>
      </Col>
      <Col>
        <InfoItem>
          <div className='label'>{"Floor"}</div>
          <div className='details'>3</div>
        </InfoItem>
      </Col>
    </Row>
  );
}
