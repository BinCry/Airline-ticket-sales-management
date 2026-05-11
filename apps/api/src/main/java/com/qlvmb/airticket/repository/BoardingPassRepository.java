package com.qlvmb.airticket.repository;

import com.qlvmb.airticket.domain.entity.BoardingPassEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardingPassRepository extends JpaRepository<BoardingPassEntity, Long> {
}
