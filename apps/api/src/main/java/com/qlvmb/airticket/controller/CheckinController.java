package com.qlvmb.airticket.controller;

import com.qlvmb.airticket.domain.dto.CheckinCompleteRequest;
import com.qlvmb.airticket.domain.dto.CheckinCompleteResponse;
import com.qlvmb.airticket.service.CheckinService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/check-in")
public class CheckinController {

  private final CheckinService checkinService;

  public CheckinController(CheckinService checkinService) {
    this.checkinService = checkinService;
  }

  @PostMapping("/complete")
  public CheckinCompleteResponse completeCheckin(@Valid @RequestBody CheckinCompleteRequest request) {
    return checkinService.completeCheckin(request);
  }
}
