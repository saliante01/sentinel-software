package com.sentinel.repository;

import com.sentinel.model.MonitorRun;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MonitorRunRepository extends JpaRepository<MonitorRun, Long> {
	Page<MonitorRun> findByMonitorId(Long monitorId, Pageable pageable);
	Optional<MonitorRun> findFirstByMonitorIdOrderByCheckedAtDesc(Long monitorId);
	@Query("select run.monitor.id, max(run.checkedAt) from MonitorRun run where run.monitor.id in :monitorIds group by run.monitor.id")
	List<Object[]> findLatestCheckedAtByMonitorIds(@Param("monitorIds") Collection<Long> monitorIds);
	void deleteByMonitorId(Long monitorId);
	void deleteByMonitorApplicationId(Long applicationId);
}
