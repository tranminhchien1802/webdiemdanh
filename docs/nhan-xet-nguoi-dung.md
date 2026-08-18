# Đánh giá trải nghiệm người dùng — Web Điểm Danh MONICA

> Tài liệu này trả lời các câu hỏi đánh giá sản phẩm từ góc nhìn người dùng, viết để các dev sau đọc và hiểu được bối cảnh, quyết định thiết kế, cũng như các vấn đề cần cải thiện.

---

## 1. Người dùng là ai?

Có **4 nhóm** người dùng, chia theo quyền hạn:

| Vai trò | Ví dụ | Họ làm gì trên app |
|---|---|---|
| **Nhân viên (EMPLOYEE)** | Nguyễn Văn A | Điểm danh, xem công, gửi đơn, xem lương |
| **Trưởng nhóm (LEADER)** | Trần Văn B | Như nhân viên + phê duyệt đơn của nhóm |
| **HR (HR_MANAGER)** | HR Manager | Quản lý nhân sự, ca, lịch, chính sách, báo cáo, duyệt đơn |
| **Super Admin** | Admin Monica | Toàn quyền như HR + thêm/thay đổi vai trò |

Người dùng thật tế nhất là **nhân viên văn phòng** (kỹ sư, kinh doanh, kế toán) — người dùng thiết bị di động nhiều hơn máy tính. Họ không rành công nghệ, cần thao tác nhanh, gọn, ít bước nhất.

---

## 2. Họ vào app để giải quyết việc gì?

Những "việc thật" mà người dùng mang tới:

1. **Điểm danh vào/ra** — việc quan trọng nhất, làm 2 lần/ngày. Yêu cầu: nhanh, không lằng nhằng, không phải mở máy tính.
2. **Xem giờ giấc công của mình** — hôm nay đã điểm danh chưa, đúng giờ hay đi muộn, tháng này bao nhiêu công.
3. **Gửi đơn** — nghỉ phép, giải trình khi quên chấm/đi muộn, công tác. Theo dõi xem HR đã duyệt chưa.
4. **Xem bảng lương** — lương tháng này bao nhiêu, gồm những khoản gì, có tăng ca không.
5. **Nhận thông báo** — đơn được duyệt, bảng lương mới, cảnh báo thiếu công.

Điểm mấu chốt: **app phục vụ nhu cầu "quản lý lao động"**, nhưng người dùng chạm tay vào nó mỗi ngày nên trải nghiệm phải mượt như app tiêu dùng.

---

## 3. Luồng sử dụng có dễ hiểu không?

### Luồng đăng ký → điểm danh (quan trọng nhất)
```
Đăng ký (tên, email, mật khẩu, chọn mã PIN 6 số)
→ xem mã PIN trên màn hình chào mừng (nhắc nhở)
→ vào hệ thống
→ menu "Điểm danh"
→ gõ PIN → bấm "Vào làm" / "Tan làm"
→ thấy đồng hồ + trạng thái cập nhật ngay
```
**Đánh giá: DỄ.** Số bước ít, nút bấm to, có đồng hồ thời gian thực giúp người dùng cảm nhận "đang được ghi nhận".

### Các luồng khác
- **Xem công/lương**: chỉ cần mở menu, dữ liệu hiện sẵn. Dễ.
- **Gửi đơn**: form có ít trường, có danh sách đơn + trạng thái ngay bên dưới. Dễ.
- **Admin**: sidebar chia rõ chức năng, ai vào thì thấy đúng phần của mình. Tương đối dễ, nhưng admin ít gặp nên không phải ưu tiên tối ưu.

### Điểm dễ gây bối rối (cần cải thiện)
- Nhân viên quên mã PIN → chưa có chỗ tự xem lại nhanh (hiện phải vào màn hình Điểm danh và bấm xem, hoặc nhờ admin).
- Không rõ "Đi muộn/Về sớm" được tính như thế nào → nên hiển thị dòng giải thích ngắn.
- Sau khi đăng nhập ở nơi khác, session cũ bị đá về login — người dùng có thể không hiểu vì sao nếu không có modal giải thích rõ.

---

## 4. Tình huống phát sinh — app xử lý thế nào?

| Tình huống | Cách app xử lý hiện tại | Đánh giá |
|---|---|---|
| Quên chấm công | Nhân viên gửi **đơn giải trình**, HR duyệt | ✔ Hợp lý |
| Đi muộn / về sớm | Hệ thống tự gắn trạng thái LATE / EARLY_LEAVE dựa vào chính sách (giờ vào chuẩn + grace 15p) | ✔ Tự động, minh bạch |
| Nhập sai PIN | Báo lỗi "Mã PIN không đúng", không chấm công | ✔ An toàn |
| Chấm công trùng (vào 2 lần / ra 2 lần) | Chặn: "Hôm nay bạn đã điểm danh rồi" | ✔ Chống gian lận |
| Đăng nhập cùng lúc 2 thiết bị | Thiết bị cũ bị **đá ra realtime** (poll 5s + modal cảnh báo) | ✔ Mạnh, chống chia sẻ tài khoản |
| Gửi đơn trùng | Chưa có cơ chế chặn trùng lặp (vd 2 đơn nghỉ cùng ngày) | ✘ Cần bổ sung |
| Quên PIN | Nhờ admin cấp lại mã mới | ✔ Nhưng chậm (phụ thuộc admin) |
| Chấm công ở nơi không phải văn phòng | Có cấu hình bán kính GPS trong Policy **nhưng chưa bật kiểm tra** | ⚠ Đã thiết kế, chưa bật |
| Tạo lương | HR bấm "Tạo bảng lương" → tự tính từ công + OT + bảo hiểm, nhân viên xem ngay | ✔ Tự động |
| Tài khoản bị khóa | Admin đổi trạng thái "Bị khóa" → không đăng nhập được | ✔ |

**Điểm yếu nhất**: các tình huống "đặc biệt" chưa có nút tự xử lý cho nhân viên (đổi PIN, tự sửa lỗi chấm công) — đều phải qua HR.

---

## 5. Nếu tôi là người dùng, dùng xong có thấy tiện và hữu ích không?

### Nếu tôi là NHÂN VIÊN: **Có, khá tiện.**
- Việc gần như duy nhất mỗi ngày là mở điện thoại → gõ PIN → chấm. Mất ~10 giây, nhanh hơn quẹt thẻ vì không phải tìm thẻ.
- Không phải gọi điện hỏi HR "tháng này tôi mấy công" — tự xem được.
- Cảm giác yên tâm vì có ngay bản ghi giờ + trạng thái sau mỗi lần chấm.
- Hạn chế: phải đăng nhập mỗi lần mở (chưa "nhớ tôi"), chưa có widget/lối tắt màn hình chính.

### Nếu tôi là HR: **Có, rất hữu ích.**
- Trước: phải gom Excel, tính tay công + lương từng người.
- Nay: mọi thứ tập trung một chỗ, tạo lương 1 nút, báo cáo xuất CSV.
- Tiết kiệm được rõ ràng thời gian hàng tháng.

### Nếu tôi là Admin/Chủ doanh nghiệp: **Có, đáng giá.**
- Kiểm soát ai có mặt/ai trốn, chống gian lận điểm danh (PIN + 1 session), đánh giá năng suất theo số công.

### Kết luận chung
App đã giải quyết **đúng bài toán cốt lõi** và dễ dùng cho người không rành công nghệ. Mức độ hữu ích thực tế phụ thuộc vào việc **dùng được trên điện thoại mượt** và **chạy trên server thật** (hiện chỉ chạy local). Để người dùng "thực sự thích", ưu tiên tiếp theo nên là:
1. Điểm danh bằng một chạm (nhớ phiên, không phải gõ lại email/mật khẩu)
2. Hiển thị rõ công thức tính giờ/lương trên giao diện
3. Tự đổi mã PIN cho nhân viên
4. Bật kiểm tra GPS chống chấm công giả
