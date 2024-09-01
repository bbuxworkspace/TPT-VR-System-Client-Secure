import React, { useState, useEffect } from "react";
import { Col, Row, Spinner } from "react-bootstrap";
import { connect } from "react-redux";
import { getDashboardData } from "../../actions/Dashboard.action";
import { getTileList } from "../../actions/Tile.action";

import Layout from "../../components/shared/Layout/Layout";
import StatCard from "../../components/shared/StatCard/StatCard";
import { BsArrowLeft, BsPencil, BsPrinter } from "react-icons/bs";
import { FiUsers } from "react-icons/fi";
import { BiBook, BiSquare } from "react-icons/bi";


const DashboardPage = ({ data, getDashboardData, getTileList }) => {

  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    const storedTiles = localStorage.getItem('tiles');
    if (storedTiles) {
      setTiles(JSON.parse(storedTiles));
      console.log("DashboardPage", tiles);
    } else {
      const loadTiles = async () => {
        const tilesFromServer = await getTileList();
        setTiles(tilesFromServer);
      };
      loadTiles();
      console.log("DashboardPage", tiles);
    }



  }, [getTileList]);


  useEffect(() => {
    getDashboardData();
  }, [getDashboardData]);


  return (
    <Layout title="Dashboard">
      {data === null ? (
        <Spinner animation="grow" variant="dark" />
      ) : (
        <Row className="pt-">

          <Col md={3} className="py-3">
            <StatCard title="Tiles" icon={<BiSquare />} count={data.tileCount == 0 ? '0' : data.tileCount} />
          </Col>
        
          <Col md={3} className="py-3">
            <StatCard title="Users" icon={<FiUsers />} count={data.userCount == 0 ? '0' : data.userCount} />
          </Col>



          <Col md={12} className="py-3">
            <h2>Shortcuts</h2>
          </Col>
          <Col md={4} className="py-3">
            <StatCard
              title="VR Dinning Hall"
              icon={<BsArrowLeft />}
              link="/hall"
            />
          </Col>

          <Col md={4} className="py-3">
            <StatCard
              title="VR Room"
              icon={<BsArrowLeft />}
              link="/room"
            />
          </Col>
          
        </Row> 
      )}
    </Layout>
  );
};

const mapStateToProps = (state) => ({
  data: state.auth.dashboard,
});

export default connect(mapStateToProps, { getDashboardData, getTileList })(DashboardPage);
