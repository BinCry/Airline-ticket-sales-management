import { supportChannels, supportFaqs } from "@/lib/public-content";

import type { ChatbotAction, ChatbotApiMessage } from "@/lib/chatbot-shared";

interface SupportReply {
  actions?: ChatbotAction[];
  reply: string;
}

interface SupportTopic {
  actions?: ChatbotAction[];
  keywords: string[];
  reply: string;
}

const hotline =
  supportChannels.find((channel) => channel.channel.includes("1900"))?.channel ??
  "1900 6868";

const supportEmail =
  supportChannels.find((channel) => channel.channel.includes("@"))?.channel ??
  "support@vietnam-airlines.vn";

const supportTopics: SupportTopic[] = [
  {
    actions: [
      { href: "/check-in", label: "Mở trang làm thủ tục" },
      { href: "/manage-booking", label: "Tra cứu đặt chỗ" }
    ],
    keywords: ["lam thu tuc", "check in", "check-in", "online", "24h", "60 phut", "boarding"],
    reply:
      "Bạn có thể làm thủ tục trực tuyến khi đã có mã đặt chỗ và họ tên hành khách đúng như trên vé.\n\nHiện luồng này mở từ 24 giờ và đóng trước 60 phút so với giờ khởi hành. Nếu có hành lý ký gửi, cần hỗ trợ đặc biệt hoặc muốn xử lý giấy tờ tại sân bay, bạn nên đến quầy sớm để được hỗ trợ thêm."
  },
  {
    actions: [
      { href: "/manage-booking", label: "Quản lý đặt chỗ" },
      { href: "/support", label: "Xem kênh hỗ trợ" }
    ],
    keywords: ["hanh ly", "xach tay", "ky gui", "mua them", "qua can", "qua kho"],
    reply:
      "Nếu bạn cần mua thêm hành lý ký gửi, mình khuyên nên kiểm tra lại mã đặt chỗ trước rồi vào phần quản lý đặt chỗ để bổ sung dịch vụ.\n\nKhi bay gần giờ, bạn vẫn nên đến sân bay sớm để xử lý phần cân hành lý hoặc các phát sinh tại quầy. Nếu cần xác minh thêm điều kiện vé, nhân viên hỗ trợ có thể giúp bạn kiểm tra cụ thể."
  },
  {
    actions: [
      { href: "/manage-booking", label: "Kiểm tra điều kiện vé" },
      { href: "/support", label: "Mở yêu cầu hỗ trợ" }
    ],
    keywords: ["doi ve", "doi chuyen", "hoan ve", "hoan tien", "thanh toan", "doi lich"],
    reply:
      `${supportFaqs[0]?.answer ?? "Bạn có thể đổi chuyến sau khi thanh toán nếu điều kiện vé cho phép."}\n\n` +
      `${supportFaqs[1]?.answer ?? "Nếu thanh toán bị treo, hệ thống sẽ đối soát để tránh nhân đôi giao dịch."}\n\n` +
      "Nếu bạn chưa chắc gói vé của mình cho phép đổi hay hoàn như thế nào, mình khuyên nên tra lại mã đặt chỗ hoặc mở yêu cầu hỗ trợ để được kiểm tra đúng điều kiện vé."
  },
  {
    actions: [{ href: "/manage-booking", label: "Tra cứu đặt chỗ" }],
    keywords: ["ma dat cho", "tra cuu", "pnr", "hanh trinh", "dat cho", "ve cua toi"],
    reply:
      "Để tra cứu hành trình hoặc kiểm tra lại đặt chỗ, bạn nên chuẩn bị mã đặt chỗ và họ tên hành khách đúng như trên vé.\n\nSau đó bạn có thể mở mục quản lý đặt chỗ để xem lại thông tin chuyến đi, dịch vụ đã mua và các bước cần làm tiếp theo."
  },
  {
    actions: [
      { href: "/flight-status", label: "Xem tình trạng chuyến bay" },
      { href: "/support", label: "Liên hệ hỗ trợ" }
    ],
    keywords: ["tre", "delay", "cham", "huy", "tinh trang", "gio bay", "flight status"],
    reply:
      "Khi chuyến bay bị chậm hoặc thay đổi giờ khai thác, bạn nên kiểm tra ngay ở trang tình trạng chuyến bay để xem cập nhật mới nhất.\n\nNếu cần đổi kế hoạch hoặc phát sinh yêu cầu sau bán, bạn có thể liên hệ tổng đài để được hướng dẫn nhanh hơn theo tình huống thực tế."
  },
  {
    actions: [{ href: "/support", label: "Mở trang hỗ trợ" }],
    keywords: ["hotline", "tong dai", "nhan vien", "lien he", "email", "khieu nai", "ho tro"],
    reply:
      `Nếu bạn cần nhân viên hỗ trợ trực tiếp, bạn có thể gọi tổng đài ${hotline} hoặc gửi email tới ${supportEmail}.\n\nTrường hợp cần đổi vé, hoàn vé, chuyến bay chậm hoặc yêu cầu xác minh thêm, mình khuyên nên chuẩn bị sẵn mã đặt chỗ để nhân viên hỗ trợ nhanh hơn.`
  },
  {
    keywords: ["dia diem", "du lich", "di dau", "goi y", "lich trinh", "nghi duong"],
    reply:
      "Nội dung này hợp với chế độ gợi ý du lịch hơn để mình đề xuất điểm đến sát nhu cầu của bạn. Bạn hãy chuyển sang tab gợi ý du lịch rồi nói rõ ngân sách, số ngày và điểm khởi hành nhé."
  }
];

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLocaleLowerCase("vi-VN");
}

function scoreTopic(topic: SupportTopic, text: string) {
  return topic.keywords.reduce((score, keyword) => {
    return score + (text.includes(keyword) ? 1 : 0);
  }, 0);
}

export function buildSupportReply(messages: ChatbotApiMessage[]): SupportReply {
  const recentMessages = messages
    .slice(-8)
    .map((message) => message.content)
    .join(" ");

  const normalizedConversation = normalizeText(recentMessages);
  let bestTopic: SupportTopic | null = null;
  let bestScore = 0;

  for (const topic of supportTopics) {
    const currentScore = scoreTopic(topic, normalizedConversation);

    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestTopic = topic;
    }
  }

  if (bestTopic && bestScore > 0) {
    return {
      actions: bestTopic.actions,
      reply: bestTopic.reply
    };
  }

  return {
    actions: [{ href: "/support", label: "Xem trang hỗ trợ" }],
    reply:
      `Mình đã đọc câu hỏi của bạn nhưng chưa đủ chắc để hướng dẫn chi tiết ngay.\n\nBạn có thể nói rõ hơn đang cần hỗ trợ về đặt chỗ, check-in, hành lý hay đổi vé. Nếu cần nhân viên hỗ trợ trực tiếp, bạn có thể gọi ${hotline} hoặc gửi email tới ${supportEmail}.`
  };
}
