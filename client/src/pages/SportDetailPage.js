
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

const SportDetailPage = () => {
  const { id } = useParams();
  const [sport, setSport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSport = async () => {
      try {
        const { data } = await axios.get(`/api/sports/${id}`);
        setSport(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch sport details');
        setLoading(false);
      }
    };

    fetchSport();
  }, [id]);

  if (loading) {
    return (
      <Container className="mt-5">
        <h2>Loading...</h2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <h2>Error</h2>
        <p>{error}</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      {sport && (
        <>
          <Row className="mb-4">
            <Col md={4}>
              {sport.imageUrl && (
                <Card.Img
                  variant="top"
                  src={sport.imageUrl}
                  alt={sport.name}
                  style={{ maxHeight: '200px', objectFit: 'contain' }}
                />
              )}
            </Col>
            <Col md={8}>
              <h1>{sport.name}</h1>
              <p>{sport.description}</p>
            </Col>
          </Row>

          {sport.leagues && sport.leagues.length > 0 && (
            <Row>
              <Col>
                <h3>Leagues</h3>
                <ListGroup>
                  {sport.leagues.map((league, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={2}>
                          {league.imageUrl && (
                            <img
                              src={league.imageUrl}
                              alt={league.name}
                              style={{ maxHeight: '50px', maxWidth: '100%' }}
                            />
                          )}
                        </Col>
                        <Col md={10}>
                          <h5>{league.name}</h5>
                          <p>{league.description}</p>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default SportDetailPage;
