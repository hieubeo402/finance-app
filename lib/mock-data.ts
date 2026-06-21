import { Transaction, Debt, FinanceState } from './types';

const now = new Date();
const fmt = (daysAgo: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

// ---- TRANSACTIONS ----
export const mockTransactions: Transaction[] = [
  // Thu nhập tháng này
  { id: 't1', type: 'income', amount: 18000000, category: 'Lương', date: fmt(18), note: 'Lương tháng 6', createdAt: fmt(18) },
  { id: 't2', type: 'income', amount: 3000000, category: 'Thưởng', date: fmt(15), note: 'Thưởng KPI quý 2', createdAt: fmt(15) },
  { id: 't3', type: 'income', amount: 500000, category: 'Lãi suất', date: fmt(10), note: 'Lãi tiết kiệm ngân hàng', createdAt: fmt(10) },
  { id: 't4', type: 'income', amount: 2500000, category: 'Freelance', date: fmt(5), note: 'Thiết kế web cho khách hàng', createdAt: fmt(5) },

  // Chi tiêu tháng này
  { id: 't5', type: 'expense', amount: 1200000, category: 'Ăn uống', date: fmt(1), note: 'Siêu thị Big C', createdAt: fmt(1) },
  { id: 't6', type: 'expense', amount: 350000, category: 'Ăn uống', date: fmt(2), note: 'Cà phê + ăn sáng', createdAt: fmt(2) },
  { id: 't7', type: 'expense', amount: 2800000, category: 'Mua sắm', date: fmt(3), note: 'Quần áo mùa hè', createdAt: fmt(3) },
  { id: 't8', type: 'expense', amount: 1500000, category: 'Hóa đơn', date: fmt(5), note: 'Điện, nước, internet', createdAt: fmt(5) },
  { id: 't9', type: 'expense', amount: 300000, category: 'Đi lại', date: fmt(4), note: 'Grab + xăng xe', createdAt: fmt(4) },
  { id: 't10', type: 'expense', amount: 750000, category: 'Giải trí', date: fmt(6), note: 'Rạp phim + Netflix', createdAt: fmt(6) },
  { id: 't11', type: 'expense', amount: 450000, category: 'Y tế', date: fmt(8), note: 'Khám sức khỏe định kỳ', createdAt: fmt(8) },
  { id: 't12', type: 'expense', amount: 600000, category: 'Ăn uống', date: fmt(9), note: 'Đi ăn nhà hàng', createdAt: fmt(9) },
  { id: 't13', type: 'expense', amount: 200000, category: 'Giáo dục', date: fmt(11), note: 'Khóa học online Udemy', createdAt: fmt(11) },

  // Thu nhập tháng trước
  { id: 't14', type: 'income', amount: 18000000, category: 'Lương', date: fmt(48), note: 'Lương tháng 5', createdAt: fmt(48) },
  { id: 't15', type: 'income', amount: 1500000, category: 'Freelance', date: fmt(40), note: 'Viết content marketing', createdAt: fmt(40) },

  // Chi tiêu tháng trước
  { id: 't16', type: 'expense', amount: 1100000, category: 'Ăn uống', date: fmt(45), note: 'Siêu thị & chợ', createdAt: fmt(45) },
  { id: 't17', type: 'expense', amount: 3200000, category: 'Du lịch', date: fmt(38), note: 'Chuyến đi Đà Lạt', createdAt: fmt(38) },
  { id: 't18', type: 'expense', amount: 1500000, category: 'Hóa đơn', date: fmt(35), note: 'Hóa đơn tháng 5', createdAt: fmt(35) },
  { id: 't19', type: 'expense', amount: 850000, category: 'Mua sắm', date: fmt(42), note: 'Đồ dùng gia đình', createdAt: fmt(42) },
  { id: 't20', type: 'expense', amount: 400000, category: 'Giải trí', date: fmt(36), note: 'Karaoke bạn bè', createdAt: fmt(36) },

  // Thu nhập tháng -2
  { id: 't21', type: 'income', amount: 18000000, category: 'Lương', date: fmt(78), note: 'Lương tháng 4', createdAt: fmt(78) },
  { id: 't22', type: 'income', amount: 5000000, category: 'Thưởng', date: fmt(75), note: 'Thưởng dự án hoàn thành', createdAt: fmt(75) },

  // Chi tiêu tháng -2
  { id: 't23', type: 'expense', amount: 1300000, category: 'Ăn uống', date: fmt(72), note: 'Siêu thị tháng 4', createdAt: fmt(72) },
  { id: 't24', type: 'expense', amount: 1500000, category: 'Hóa đơn', date: fmt(65), note: 'Hóa đơn tháng 4', createdAt: fmt(65) },
  { id: 't25', type: 'expense', amount: 1200000, category: 'Đi lại', date: fmt(70), note: 'Vé máy bay', createdAt: fmt(70) },
];

// ---- DEBTS ----
export const mockDebts: Debt[] = [
  {
    id: 'd1',
    creditorName: 'Ngân hàng Techcombank',
    totalAmount: 50000000,
    paidAmount: 20000000,
    dueDate: new Date(now.getFullYear(), now.getMonth() + 3, 15).toISOString(),
    status: 'Đang nợ',
    note: 'Vay mua xe máy',
    createdAt: fmt(90),
    payments: [
      { id: 'p1', amount: 10000000, date: fmt(60), note: 'Trả kỳ 1' },
      { id: 'p2', amount: 10000000, date: fmt(30), note: 'Trả kỳ 2' },
    ],
  },
  {
    id: 'd2',
    creditorName: 'Anh Minh (bạn bè)',
    totalAmount: 5000000,
    paidAmount: 5000000,
    dueDate: fmt(-15),
    status: 'Đã trả xong',
    note: 'Mượn tiền sửa laptop',
    createdAt: fmt(60),
    payments: [
      { id: 'p3', amount: 5000000, date: fmt(20), note: 'Trả hết một lần' },
    ],
  },
  {
    id: 'd3',
    creditorName: 'Chị Lan (đồng nghiệp)',
    totalAmount: 2000000,
    paidAmount: 500000,
    dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
    status: 'Đang nợ',
    note: 'Vay tiền đặt cọc thuê nhà',
    createdAt: fmt(45),
    payments: [
      { id: 'p4', amount: 500000, date: fmt(15), note: 'Trả trước một phần' },
    ],
  },
];

export const initialMockState: FinanceState = {
  transactions: mockTransactions,
  debts: mockDebts,
  loans: [],
  budgets: [],
};
