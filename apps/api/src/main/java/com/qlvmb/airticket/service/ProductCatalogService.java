package com.qlvmb.airticket.service;

import com.qlvmb.airticket.domain.dto.FlightSearchResponse;
import com.qlvmb.airticket.exception.BadRequestException;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ProductCatalogService {

  private static final Map<String, FareMeta> FARE_CATALOG = Map.of(
      "pho_thong_tiet_kiem",
      new FareMeta("Pho thong tiet kiem", List.of("7kg hanh ly xach tay", "Doi ve co phi", "Chon ghe tinh phi")),
      "pho_thong_linh_hoat",
      new FareMeta("Pho thong linh hoat", List.of("1 kien 23kg", "Doi ve it phi hon", "Uu tien giu gia 24 gio")),
      "thuong_gia",
      new FareMeta("Thuong gia", List.of("2 kien 32kg", "Phong cho", "Hoan doi linh hoat"))
  );

  private static final Map<String, AncillaryMeta> ANCILLARY_CATALOG = Map.of(
      "SEAT_PLUS",
      new AncillaryMeta("SEAT_PLUS", "Ghe hang dau", "Them cho duoi chan va uu tien xuong tau.", 320000),
      "BAG_23",
      new AncillaryMeta("BAG_23", "Hanh ly ky gui 23kg", "Mua truoc thanh toan hoac bo sung sau dat cho.", 290000),
      "MEAL_VN",
      new AncillaryMeta("MEAL_VN", "Suat an dia phuong", "Tuy chon mon Viet va mon chay tren tuyen truc.", 180000),
      "INSURE",
      new AncillaryMeta("INSURE", "Bao hiem du lich", "Kich hoat cung luot dat cho va ghi nhan vao hoa don.", 95000)
  );

  public FareMeta requireFareMeta(String fareFamily) {
    FareMeta fareMeta = FARE_CATALOG.get(normalizeFareFamily(fareFamily));
    if (fareMeta == null) {
      throw new BadRequestException("Gói giá được chọn không hợp lệ.");
    }
    return fareMeta;
  }

  public AncillaryMeta requireAncillary(String code) {
    AncillaryMeta ancillaryMeta = ANCILLARY_CATALOG.get(normalizeAncillaryCode(code));
    if (ancillaryMeta == null) {
      throw new BadRequestException("Dịch vụ bổ trợ được chọn không hợp lệ.");
    }
    return ancillaryMeta;
  }

  public List<FlightSearchResponse.FareCard> buildFareCards(Collection<FlightSearchResponse.FlightCard> flightCards) {
    return flightCards.stream()
        .collect(Collectors.groupingBy(
            FlightSearchResponse.FlightCard::fareFamily,
            Collectors.minBy(Comparator.comparingLong(FlightSearchResponse.FlightCard::price))
        ))
        .entrySet()
        .stream()
        .map(entry -> {
          FareMeta fareMeta = requireFareMeta(entry.getKey());
          long price = entry.getValue().map(FlightSearchResponse.FlightCard::price).orElse(0L);
          return new FlightSearchResponse.FareCard(entry.getKey(), fareMeta.title(), price, fareMeta.perks());
        })
        .sorted(Comparator.comparing(FlightSearchResponse.FareCard::price))
        .toList();
  }

  public String normalizeFareFamily(String fareFamily) {
    if (fareFamily == null) {
      return null;
    }
    return fareFamily.trim().toLowerCase();
  }

  public String normalizeAncillaryCode(String code) {
    return Objects.requireNonNull(code).trim().toUpperCase();
  }

  public record FareMeta(String title, List<String> perks) {
  }

  public record AncillaryMeta(String code, String name, String description, long price) {
  }
}
