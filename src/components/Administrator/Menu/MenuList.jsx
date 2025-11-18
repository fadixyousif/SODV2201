// Menu List Component
import { Button, Card, Col, Row } from 'react-bootstrap';

// Menu List Component
function MenuList({ menuItems, setEditingItem, setShowEditingModal }) {
    // render the menu list
    return (
        /* 
            Menu List
            Displays menu items categorized by their category in a card format
            Each card shows item details like name, description, price, and availability
            with an edit button to modify the item
        */
        <>
            {Object.keys(menuItems).length > 0 && (
                <div className="p-4 mt-4">
                    {Object.keys(menuItems).map((category) => (
                        <div key={category} className="mb-4">
                            <h3>{category}</h3>
                            {menuItems[category].length > 0 ? (
                                <Row className="g-3">
                                    {menuItems[category].map((item, i) => (
                                        <Col key={`${category}-${item.name}-${i}`} xs={12} sm={6} md={4} lg={3}>
                                            <Card className="h-100 shadow-sm small-menu-card" style={{
                                                background: '#23272b',
                                                borderColor: '#495057',
                                                border: '1px solid',
                                                borderRadius: '12px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                color: '#fff'
                                            }}>
                                                {item.imageUrl && (
                                                    <Card.Img
                                                        variant="top"
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        style={{ objectFit: 'cover', height: '120px', borderRadius: '0.5rem 0.5rem 0 0' }}
                                                    />
                                                )}
                                                <Card.Body className="d-flex flex-column p-2">
                                                    <h6 className="mb-1 text-truncate">{item.name}</h6>
                                                    <div className="mb-1 text-muted" style={{ fontSize: '0.95em' }}>{item.description}</div>
                                                    <div className="mb-1"><strong>${item.price}</strong></div>
                                                    <div className="d-flex align-items-center justify-content-between mt-auto">
                                                        <span className={item.available ? 'text-success' : 'text-danger'}>
                                                            {item.available ? 'Available' : 'Unavailable'}
                                                        </span>
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingItem(item);
                                                                setShowEditingModal(true);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            ) : (
                                <p>No items available in this category.</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default MenuList;