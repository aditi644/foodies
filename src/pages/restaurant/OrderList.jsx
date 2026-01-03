import React from 'react';
import supabase from '../../lib/supabase';
import toast from 'react-hot-toast';

const OrderList = ({ orders, onUpdate }) => {
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order status updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'confirmed':
        return '#17a2b8';
      case 'preparing':
        return '#007bff';
      case 'ready':
        return '#28a745';
      case 'completed':
        return '#6c757d';
      default:
        return '#999';
    }
  };

  return (
    <div>
      {orders.length === 0 ? (
        <p style={styles.emptyText}>No orders yet</p>
      ) : (
        <div style={styles.orderList}>
          {orders.map((order) => (
            <div key={order.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <h3 style={styles.orderId}>Order #{order.id.slice(0, 8)}</h3>
                  <p style={styles.orderDate}>
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(order.status),
                  }}
                >
                  {order.status}
                </span>
              </div>

              <div style={styles.orderItems}>
                <h4>Items:</h4>
                {order.order_items?.map((item, idx) => (
                  <div key={idx} style={styles.orderItem}>
                    <span>
                      {item.quantity}x {item.dish?.name || 'Dish'}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={styles.orderTotal}>
                <strong>Total: ${order.total_amount?.toFixed(2)}</strong>
              </div>

              <div style={styles.orderActions}>
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'confirmed')}
                      style={styles.confirmButton}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => updateOrderStatus(order.id, 'rejected')}
                      style={styles.rejectButton}
                    >
                      Reject
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    style={styles.prepareButton}
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    style={styles.readyButton}
                  >
                    Mark as Ready
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: '40px',
  },
  orderList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  orderCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '10px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  orderId: {
    margin: 0,
    color: '#2f3542',
  },
  orderDate: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px',
  },
  statusBadge: {
    padding: '5px 15px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  orderItems: {
    marginBottom: '15px',
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e0e0e0',
  },
  orderTotal: {
    textAlign: 'right',
    fontSize: '18px',
    marginBottom: '15px',
    color: '#ff4757',
  },
  orderActions: {
    display: 'flex',
    gap: '10px',
  },
  confirmButton: {
    padding: '8px 15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  rejectButton: {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  prepareButton: {
    padding: '8px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  readyButton: {
    padding: '8px 15px',
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default OrderList;

